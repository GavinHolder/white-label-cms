"""
Volt Studio Sync — Blender 4.x Addon
Exports the active scene as GLB (and optionally .blend) and POSTs it to the
Volt Studio CMS API at /api/volt-3d.

Dependencies: Python stdlib only (urllib.request, json, os, tempfile, uuid).
"""

bl_info = {
    "name": "Volt Studio Sync",
    "author": "Volt Studio",
    "version": (1, 0, 0),
    "blender": (4, 0, 0),
    "location": "View3D > Sidebar > Volt",
    "category": "Import-Export",
}

import bpy
import json
import os
import shutil
import tempfile
import uuid
import urllib.request
import urllib.error
from bpy.props import StringProperty, BoolProperty, PointerProperty
from bpy.types import AddonPreferences, PropertyGroup, Operator, Panel


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def build_multipart(fields, files, boundary):
    """
    Build a multipart/form-data body as bytes.

    ASSUMPTIONS:
    1. field values are str-coercible
    2. file content is already bytes
    3. boundary contains no special characters

    FAILURE MODES:
    - Non-bytes file content → TypeError at body concatenation
    - Boundary collision with content → malformed body (mitigated by uuid hex)
    """
    body = b''
    for name, value in fields.items():
        body += f'--{boundary}\r\n'.encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += f'{value}\r\n'.encode()
    for name, (filename, content, ctype) in files.items():
        body += f'--{boundary}\r\n'.encode()
        body += f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode()
        body += f'Content-Type: {ctype}\r\n\r\n'.encode()
        body += content + b'\r\n'
    body += f'--{boundary}--\r\n'.encode()
    return body


def detect_animation_clips():
    """
    Walk all objects' NLA tracks and collect unique animation clips.

    Returns a list of dicts: {name, duration, isDefault}.
    The first unique action found is marked isDefault=True.
    """
    clips = []
    seen = set()
    fps = bpy.context.scene.render.fps

    for obj in bpy.data.objects:
        if obj.animation_data:
            for track in obj.animation_data.nla_tracks:
                for strip in track.strips:
                    if strip.action and strip.action.name not in seen:
                        seen.add(strip.action.name)
                        frame_start, frame_end = strip.action.frame_range
                        duration = (frame_end - frame_start) / fps
                        clips.append({
                            'name': strip.action.name,
                            'duration': round(duration, 3),
                            'isDefault': len(clips) == 0,
                        })
    return clips


# ---------------------------------------------------------------------------
# Addon Preferences
# ---------------------------------------------------------------------------

class VoltAddonPreferences(AddonPreferences):
    """Stored in user preferences — persists across sessions."""

    bl_idname = __name__

    api_url: StringProperty(
        name="API URL",
        default="http://localhost:3000",
    )
    api_key: StringProperty(
        name="API Key",
        subtype='PASSWORD',
    )

    def draw(self, context):
        layout = self.layout
        layout.prop(self, "api_url")
        layout.prop(self, "api_key")


# ---------------------------------------------------------------------------
# Scene Properties
# ---------------------------------------------------------------------------

class VoltSceneProps(PropertyGroup):
    """Per-scene properties stored on bpy.types.Scene.volt_props."""

    asset_name: StringProperty(
        name="Asset Name",
        default="My 3D Object",
    )
    asset_id: StringProperty(
        name="Asset ID (optional)",
        description="Leave blank to create new asset",
    )
    include_blend: BoolProperty(
        name="Include .blend file",
        default=True,
    )
    last_status: StringProperty(
        name="Status",
        default="Ready",
    )


# ---------------------------------------------------------------------------
# Operator
# ---------------------------------------------------------------------------

class VOLT_OT_sync(Operator):
    """Export scene as GLB (and optionally .blend) then POST to Volt Studio."""

    bl_idname = "volt.sync"
    bl_label = "Export & Sync to Volt"
    bl_description = "Export the current scene and upload it to the Volt Studio CMS"

    def execute(self, context):
        """
        ASSUMPTIONS:
        1. Blender's glTF exporter operator is available (built-in addon enabled)
        2. The API endpoint accepts multipart/form-data with fields: name, assetId, animClips
        3. The API responds with JSON containing at minimum an 'id' field on success
        4. A writable temp directory is available on the OS

        FAILURE MODES:
        - glTF exporter not enabled → OperatorNotFound → caught, sets error status
        - Network unreachable → urllib.error.URLError → caught, sets error status
        - API returns non-200 → HTTPError → caught, sets error status
        - JSON parse failure → ValueError → caught, sets error status
        - Temp dir creation fails → OSError → caught, sets error status
        """
        props = context.scene.volt_props
        prefs = context.preferences.addons[__name__].preferences

        # --- Validation ---
        if not prefs.api_url:
            props.last_status = "Error: API URL is not configured in addon preferences"
            self.report({'ERROR'}, props.last_status)
            return {'CANCELLED'}

        if not prefs.api_key.startswith('vlt_'):
            props.last_status = "Error: API Key must start with 'vlt_' — check addon preferences"
            self.report({'ERROR'}, props.last_status)
            return {'CANCELLED'}

        tmp_dir = None
        try:
            # --- Temp directory ---
            tmp_dir = tempfile.mkdtemp(prefix='volt_sync_')

            # --- Export GLB ---
            props.last_status = "Exporting GLB…"
            glb_path = os.path.join(tmp_dir, 'export.glb')
            bpy.ops.export_scene.gltf(
                filepath=glb_path,
                export_format='GLB',
                export_animations=True,
                use_selection=False,
            )

            # --- Optionally save .blend copy ---
            blend_path = None
            if props.include_blend:
                props.last_status = "Saving .blend copy…"
                blend_path = os.path.join(tmp_dir, 'export.blend')
                bpy.ops.wm.save_as_mainfile(filepath=blend_path, copy=True)

            # --- Detect animation clips ---
            clips = detect_animation_clips()

            # --- Build multipart body ---
            props.last_status = "Uploading to Volt Studio…"
            boundary = uuid.uuid4().hex

            fields = {
                'name': props.asset_name,
                'animClips': json.dumps(clips),
            }
            if props.asset_id.strip():
                fields['assetId'] = props.asset_id.strip()

            files = {}

            with open(glb_path, 'rb') as f:
                glb_bytes = f.read()
            files['glb'] = ('export.glb', glb_bytes, 'model/gltf-binary')

            if blend_path and os.path.exists(blend_path):
                with open(blend_path, 'rb') as f:
                    blend_bytes = f.read()
                files['blend'] = ('export.blend', blend_bytes, 'application/octet-stream')

            body = build_multipart(fields, files, boundary)

            # --- HTTP POST ---
            url = f"{prefs.api_url.rstrip('/')}/api/volt-3d"
            req = urllib.request.Request(
                url,
                data=body,
                method='POST',
                headers={
                    'Authorization': f'Bearer {prefs.api_key}',
                    'Content-Type': f'multipart/form-data; boundary={boundary}',
                },
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                raw = response.read().decode('utf-8')

            # --- Parse response ---
            try:
                data = json.loads(raw)
            except ValueError:
                props.last_status = "Error: Server returned non-JSON response"
                self.report({'ERROR'}, props.last_status)
                return {'CANCELLED'}

            # Update asset_id if this was a new asset creation
            new_id = data.get('id') or data.get('assetId') or ''
            if new_id and not props.asset_id.strip():
                props.asset_id = str(new_id)

            props.last_status = f"Synced OK — asset {props.asset_id or new_id}"
            self.report({'INFO'}, props.last_status)
            return {'FINISHED'}

        except urllib.error.HTTPError as exc:
            body_text = ''
            try:
                body_text = exc.read().decode('utf-8')[:200]
            except Exception:
                pass
            props.last_status = f"Error: HTTP {exc.code} — {body_text or exc.reason}"
            self.report({'ERROR'}, props.last_status)
            return {'CANCELLED'}

        except urllib.error.URLError as exc:
            props.last_status = f"Error: Network — {exc.reason}"
            self.report({'ERROR'}, props.last_status)
            return {'CANCELLED'}

        except Exception as exc:
            props.last_status = f"Error: {exc}"
            self.report({'ERROR'}, props.last_status)
            return {'CANCELLED'}

        finally:
            if tmp_dir and os.path.exists(tmp_dir):
                shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# Panel
# ---------------------------------------------------------------------------

class VOLT_PT_sync_panel(Panel):
    """Sidebar panel in View3D > Volt tab."""

    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Volt'
    bl_label = 'Volt Studio Sync'

    def draw(self, context):
        layout = self.layout
        props = context.scene.volt_props
        prefs = context.preferences.addons[__name__].preferences

        # --- Preferences status ---
        box = layout.box()
        col = box.column(align=True)
        col.label(text="API URL:", icon='URL')
        col.label(text=prefs.api_url or "(not set)", icon='BLANK1')
        col.label(
            text="API Key: set" if prefs.api_key else "API Key: NOT SET",
            icon='CHECKMARK' if prefs.api_key else 'ERROR',
        )

        layout.separator()

        # --- Asset fields ---
        layout.prop(props, "asset_name")

        row = layout.row()
        row.prop(props, "asset_id")
        row.enabled = True  # always editable; blank = new asset

        layout.prop(props, "include_blend")

        layout.separator()

        # --- Sync button ---
        layout.operator("volt.sync", icon='EXPORT')

        layout.separator()

        # --- Status box ---
        status = props.last_status
        status_box = layout.box()
        row = status_box.row()
        is_error = "Error" in status or "error" in status
        row.alert = is_error
        row.label(
            text=status,
            icon='ERROR' if is_error else 'INFO',
        )


# ---------------------------------------------------------------------------
# Register / Unregister
# ---------------------------------------------------------------------------

classes = [
    VoltAddonPreferences,
    VoltSceneProps,
    VOLT_OT_sync,
    VOLT_PT_sync_panel,
]


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.volt_props = PointerProperty(type=VoltSceneProps)


def unregister():
    del bpy.types.Scene.volt_props
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
