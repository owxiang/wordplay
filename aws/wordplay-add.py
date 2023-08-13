import json
import boto3
import logging
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
try:
    table = dynamodb.Table('wordplay')
except dynamodb.meta.client.exceptions.ResourceNotFoundException:
    logger.error("Table 'wordplay' does not exist")
    exit(1)
except dynamodb.meta.client.exceptions.ClientError as e:
    logger.error(f"Error accessing table 'wordplay': {str(e)}")
    exit(1)


def lambda_handler(event=None, context=None):
    logger.info(f"Received event: {json.dumps(event)}")

    entries = json.loads(event['body'])

    now = datetime.now()
    time_plus_eight = now + timedelta(hours=8)
    formatted_time = time_plus_eight.strftime("%Y-%m-%d %H:%M:%S")

    # https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
    def chunks(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    for chunk in chunks(entries, 25):
        with table.batch_writer() as batch:
            for entry in chunk:
                item = {
                    'id': str(uuid.uuid4()),  # Python auto-generated UUID
                    # 'id': context.aws_request_id,  # AWS auto-generated UUID
                    'abbreviation': entry['abbreviation'],
                    'acronym': entry['acronym'],
                    'by': event['queryStringParameters']['email'],
                    'status': 'pending_add',
                    'datetime': formatted_time
                }
                try:
                    logger.info(
                        f"Attempting to add the following item: {json.dumps(item)}")
                    batch.put_item(Item=item)
                    logger.info(
                        f"Item with ID: {context.aws_request_id} added successfully")
                except Exception as e:
                    logger.error(
                        f"Error adding item with ID: {context.aws_request_id}. Error: {str(e)}")
                    return {
                        'statusCode': 500,
                        'body': json.dumps('Error adding item')
                    }

    return {
        'statusCode': 200,
        'body': json.dumps('All items added successfully')
    }
