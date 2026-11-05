from pydantic import BaseModel, ConfigDict, HttpUrl


class LinkPreviewRequest(BaseModel):
    """Request class for link previews"""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    url: HttpUrl


class LinkPreviewResponse(BaseModel):
    """Response for link previews"""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    title: str | None = None 
    description: str | None = None
    image: str | None = None 
    favicon : str | None = None 
    site_name: str | None = None
    final_url : str

