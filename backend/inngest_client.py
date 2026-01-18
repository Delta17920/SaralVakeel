import os
import inngest

# Initialize Inngest Client
# Auto-detect production if signing key is present
is_prod = os.getenv("INNGEST_SIGNING_KEY") is not None

inngest_client = inngest.Inngest(
    app_id="saral-vakeel-backend",
    is_production=is_prod,
)
