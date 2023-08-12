import boto3
from datetime import datetime, timedelta
import logging
import json

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


def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")

    item_id = event['queryStringParameters']['id']
    action = event['queryStringParameters']['action']
    status = event['queryStringParameters']['status']
    statusCheck = status
    logger.info(
        f"Action: {action}, Status: {status}, Status Check: {statusCheck}")

    if action == 'approve':
        approve(item_id, statusCheck, status)

    elif action == 'reject':
        reject(item_id, statusCheck, status)


def approve(item_id, statusCheck, status):

    logger.info(f"Approving item with ID: {item_id}, Status: {status}")

    # if add is approved, status changes to approved
    if 'pending_add' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :approved',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':approved': 'approved'}
        )
        logger.info(f"Item with ID: {item_id} approved for addition")

    # if delete is approved, status changes to deleted
    elif 'pending_delete' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :deleted',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':deleted': 'deleted'}
        )
        logger.info(f"Item with ID: {item_id} approved for deletion")

    # if update is approved, 'status' changes to approved, 'by' changes to update requestor, datetime changes to now
    elif 'pending_update' in statusCheck:
        status_parts = status.split('\n')
        current_acronym = status_parts[1].split(': ')[1]
        current_abbreviation = status_parts[2].split(': ')[1]
        new_acronym = status_parts[3].split(': ')[1]
        new_abbreviation = status_parts[4].split(': ')[1]
        by = status_parts[5].split(': ')[1]

        now = datetime.now()
        time_plus_eight = now + timedelta(hours=8)

        # Format the time as a string
        formatted_time = time_plus_eight.strftime("%Y-%m-%d %H:%M:%S")

        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #acronym = :new_acronym, #abbreviation = :new_abbreviation, #by = :by, #datetime = :datetime, #status = :status',
            ExpressionAttributeNames={'#acronym': 'acronym', '#abbreviation': 'abbreviation',
                                      '#by': 'by', '#datetime': 'datetime', '#status': 'status'},
            ExpressionAttributeValues={
                ':new_acronym': new_acronym,
                ':new_abbreviation': new_abbreviation,
                ':by': by,
                ':datetime': formatted_time,
                ':status': 'approved'
            }
        )
        logger.info(f"Item with ID: {item_id} approved for update")


def reject(item_id, statusCheck, status):
    logger.info(f"Rejecting item with ID: {item_id}, Status: {status}")

    # if add is rejected, status changes to rejected
    if 'pending_add' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :rejected',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':rejected': 'rejected'}
        )
        logger.info(f"Item with ID: {item_id} rejected for addition")

    # if delete is rejected, status returns to approved
    elif 'pending_delete' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :approved',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':approved': 'approved'}
        )
        logger.info(f"Item with ID: {item_id} rejected for deletion")

    # if update is rejected, status returns to approved
    elif 'pending_update' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :approved',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':approved': 'approved'}
        )
        logger.info(f"Item with ID: {item_id} rejected for update")
