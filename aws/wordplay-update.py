import boto3
import json
from datetime import datetime, timedelta
import logging

dynamodb = boto3.resource('dynamodb')

try:
    table = dynamodb.Table('wordplay')
except dynamodb.meta.client.exceptions.ResourceNotFoundException:
    logger.error("Table 'wordplay' does not exist")
    exit(1)
except dynamodb.meta.client.exceptions.ClientError as e:
    logger.error(f"Error accessing table 'wordplay': {str(e)}")
    exit(1)

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        logger.info(f"Received event: {json.dumps(event)}")

        item_id = event['queryStringParameters']['id']
        status = event['queryStringParameters']['status']

        logger.info(
            f"Updating item with ID {item_id}. Setting status to {status}.")

        response = table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :pendingupdate',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':pendingupdate': status}
        )

        logger.info(f"Update response: {json.dumps(response)}")

        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            logger.info(
                f"Successfully updated item with ID {item_id} to status {status}.")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Item status updated to "pending update"',
                    'itemId': item_id
                })
            }
        else:
            logger.error(
                f"Failed to update item with ID {item_id}. Response: {json.dumps(response)}")
            raise Exception("Item update failed")

    except Exception as e:
        logger.error(f"Error occurred: {str(e)}. Event: {json.dumps(event)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': str(e)
            })
        }
