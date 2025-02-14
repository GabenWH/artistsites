import json
import boto3

S3_BUCKET = "test-image-art"
ARTFILES_JSON = "artfiles/artfiles.json"
s3 = boto3.client("s3")

def lambda_handler(event, context):
    try:
        for record in event["Records"]:
            event_type = record["eventName"]
            file_key = record["s3"]["object"]["key"]

            print(f"🟢 Event: {event_type}, File: {file_key}")

            # Load existing `artfiles.json`
            try:
                obj = s3.get_object(Bucket=S3_BUCKET, Key=ARTFILES_JSON)
                artfiles = json.loads(obj["Body"].read().decode("utf-8"))
            except s3.exceptions.NoSuchKey:
                artfiles = []  # Create a new JSON file if none exists

            if "ObjectCreated" in event_type:
                # 🔹 Handle file creation
                try:
                    obj = s3.get_object(Bucket=S3_BUCKET, Key=file_key)
                    content = obj["Body"].read().decode("utf-8").split("\n")

                    image_name = content[0].strip()
                    tags = content[1].strip()
                    date = content[3].strip()
                    image_url = f"https://{S3_BUCKET}.s3.us-east-1.amazonaws.com/images/{image_name}"

                    new_entry = {
                        "imageName": image_name,
                        "imageUrl": image_url,
                        "tags": tags,
                        "date": int(date),
                        "price": "Not for Sale",
                        "displayLines": content,
                    }

                    # Remove old entry if it exists
                    artfiles = [entry for entry in artfiles if entry["imageName"] != image_name]
                    artfiles.append(new_entry)
                    print(f"✅ Added/Updated entry: {image_name}")

                except s3.exceptions.NoSuchKey:
                    print(f"⚠️ File {file_key} does not exist. Skipping.")
                    continue

            elif "ObjectRemoved" in event_type:
                # 🔹 Handle file deletion
                image_name = file_key.split("/")[-1]
                before_count = len(artfiles)
                artfiles = [entry for entry in artfiles if entry["imageName"] != image_name]
                after_count = len(artfiles)

                if before_count == after_count:
                    print(f"⚠️ File {image_name} was not found in `artfiles.json`. No changes made.")
                else:
                    print(f"🗑️ Removed entry: {image_name}")

            # Save updated `artfiles.json`
            s3.put_object(
                Bucket=S3_BUCKET,
                Key=ARTFILES_JSON,
                Body=json.dumps(artfiles, indent=4),
                ContentType="application/json"
            )

        print("✅ artfiles.json updated successfully!")
        return {"statusCode": 200, "body": json.dumps("Success")}

    except Exception as e:
        print(f"❌ Error processing S3 event: {e}")
        return {"statusCode": 500, "body": json.dumps(str(e))}
