import os
import inngest

# Initialize Inngest Client
inngest_client = inngest.Inngest(
    app_id="saral-vakeel-backend",
    is_production=os.getenv("INNGEST_ENVIRONMENT", "development") == "production",
)
