"""
Brain 2 — Domain Intelligence Engine

Knowledge Packs + Domain Detector + Organization Profiles.
"""

from .detector import detect_domain
from .packs import load_knowledge_pack, list_packs, merge_pack_into_config
from .organization import (
    match_organization_profile,
    learn_organization_profile,
    list_organization_profiles,
)

__all__ = [
    "detect_domain",
    "load_knowledge_pack",
    "list_packs",
    "merge_pack_into_config",
    "match_organization_profile",
    "learn_organization_profile",
    "list_organization_profiles",
]
