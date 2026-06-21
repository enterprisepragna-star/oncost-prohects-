"""Emergent Object Storage helpers — persistent image storage across redeploys."""
import os
import logging
import requests
from typing import Optional

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "oncost-catalog"

logger = logging.getLogger("oncost.storage")

_storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    """Initialize once at startup. Returns the session-scoped storage_key."""
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY not set — object storage disabled, falling back to local disk")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        logger.info("Emergent object storage initialized")
        return _storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def _ensure_key() -> Optional[str]:
    if _storage_key:
        return _storage_key
    return init_storage()


def put_object(path: str, data: bytes, content_type: str) -> Optional[str]:
    """Upload bytes to object storage. Returns the canonical path on success, else None."""
    key = _ensure_key()
    if not key:
        return None
    try:
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
        if resp.status_code == 403:
            # storage_key may have expired — re-init once
            global _storage_key
            _storage_key = None
            key = init_storage()
            if not key:
                return None
            resp = requests.put(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key, "Content-Type": content_type},
                data=data,
                timeout=120,
            )
        resp.raise_for_status()
        return resp.json().get("path", path)
    except Exception as e:
        logger.error(f"put_object failed for {path}: {e}")
        return None


def get_object(path: str):
    """Returns (bytes, content_type) or (None, None) on failure."""
    key = _ensure_key()
    if not key:
        return None, None
    try:
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
        if resp.status_code == 403:
            global _storage_key
            _storage_key = None
            key = init_storage()
            if not key:
                return None, None
            resp = requests.get(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key},
                timeout=60,
            )
        if resp.status_code == 404:
            return None, None
        resp.raise_for_status()
        return resp.content, resp.headers.get("Content-Type", "image/jpeg")
    except Exception as e:
        logger.error(f"get_object failed for {path}: {e}")
        return None, None


def build_storage_path(filename: str) -> str:
    """Returns canonical storage path for an image filename."""
    return f"{APP_NAME}/product_images/{filename}"
