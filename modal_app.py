"""
Modal deployment for the State Millionaire Surtax Calculator API.
"""

import modal

# Define the Modal app
app = modal.App("state-millionaire-surtax-api")

# Create the image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi==0.109.0",
        "uvicorn[standard]==0.27.0",
        "pydantic==2.5.3",
        "pydantic-settings==2.1.0",
        "policyengine_us>=1.434.0",
        "numpy",
        "pandas",
        "cachetools==5.3.2",
    )
    .copy_local_dir("backend/app", "/app/app")
)


@app.function(
    image=image,
    cpu=2.0,
    memory=4096,
    timeout=600,
    allow_concurrent_inputs=10,
)
@modal.asgi_app()
def fastapi_app():
    """Deploy the FastAPI app on Modal."""
    import sys
    sys.path.insert(0, "/app")
    from app.main import app as api_app
    return api_app


# For local testing
if __name__ == "__main__":
    app.serve()
