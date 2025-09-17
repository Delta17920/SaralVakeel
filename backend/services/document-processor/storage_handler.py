# storage_handler.py

from google.cloud import storage
import os

def upload_document(bucket_name: str, source_file_path: str, destination_blob_name: str):
    """Uploads a file to the specified Google Cloud Storage bucket."""
    storage_client = storage.Client()
    try:
        bucket = storage_client.get_bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(source_file_path)
        print(f"✅ File '{source_file_path}' uploaded to '{destination_blob_name}'.")
    except Exception as e:
        print(f"❌ Error uploading file: {e}")

# --- Main execution block to run the test ---
# storage_handler.py
# ... (upload_document function remains the same) ...

if __name__ == '__main__':
    BUCKET_NAME = "lexi-simplify-uploads-v4"

    # --- UPDATE THIS LINE ---
    TEST_FILE_NAME = "BCSE202L_DATA-STRUCTURES-AND-ALGORITHMS_TH_1.0_67_BCSE202L.pdf" # <-- Change this to your PDF's name

    # We've commented out the dummy file creation
    # with open(TEST_FILE_NAME, "w") as f:
    #     f.write("This is a test lease for triggering the cloud function.")

    DESTINATION_NAME = f"uploads/user_final_test/{TEST_FILE_NAME}"
    upload_document(BUCKET_NAME, TEST_FILE_NAME, DESTINATION_NAME)

    # We don't need to remove the file
    # os.remove(TEST_FILE_NAME)
    
    # Clean up the local dummy file
    os.remove(TEST_FILE_NAME)