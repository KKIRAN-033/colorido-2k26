"""Registration ID generator for COLORIDO 2K26.

Format: CLR26-{EVENT_CODE}-{SEQUENCE_NUMBER}
Example: CLR26-BSK-00001, CLR26-DNC-00127
"""

# Mapping of event slugs/categories to short codes
EVENT_CODES = {
    # Cultural
    "fine-arts": "FAR",
    "music-band-solo": "MSS",
    "music-band-group": "MSG",
    "dance-solo": "DNS",
    "dance-group": "DNG",
    "choreoday": "CHR",
    "dramatics": "DRM",
    "fashion-show": "FSH",
    "tekraft-events": "TKR",
    "literary": "LIT",
    # Sports Boys
    "basketball-boys": "BSK",
    "volleyball-boys": "VLB",
    "table-tennis-boys": "TTB",
    # Sports Girls
    "throwball-girls": "THR",
    "tennikoit-girls": "TNK",
    "table-tennis-girls": "TTG",
}


def get_event_code(slug: str) -> str:
    """Get the 3-letter event code from event slug."""
    return EVENT_CODES.get(slug, slug[:3].upper())


def generate_registration_id(event_slug: str, sequence_number: int) -> str:
    """Generate a unique registration ID.
    
    Args:
        event_slug: The event's slug identifier
        sequence_number: Auto-incrementing sequence number
    
    Returns:
        Formatted registration ID like CLR26-BSK-00482
    """
    code = get_event_code(event_slug)
    return f"CLR26-{code}-{sequence_number:05d}"
