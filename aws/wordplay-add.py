import json
import boto3
import logging
from datetime import datetime, timedelta

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

    now = datetime.now()
    time_plus_eight = now + timedelta(hours=8)
    formatted_time = time_plus_eight.strftime("%Y-%m-%d %H:%M:%S")

    item = {
        'id': context.aws_request_id,  # AWS auto-generated UUID
        'abbreviation': event['queryStringParameters']['abbreviation'],
        'acronym': event['queryStringParameters']['acronym'],
        'by': event['queryStringParameters']['email'],
        'status': 'pending_add',
        'datetime': formatted_time
    }

    try:
        logger.info(
            f"Attempting to add the following item: {json.dumps(item)}")
        table.put_item(Item=item)
        logger.info(
            f"Item with ID: {context.aws_request_id} added successfully")
        return {
            'statusCode': 200,
            'body': json.dumps('Item added successfully')
        }
    except Exception as e:
        logger.error(
            f"Error adding item with ID: {context.aws_request_id}. Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error adding item')
        }
