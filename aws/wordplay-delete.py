import boto3
import json
import logging

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
    try:
        logger.info(f"Received event: {json.dumps(event)}")

        item_id = event['queryStringParameters']['id']
        status = event['queryStringParameters']['status']

        response = table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :pendingdelete',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':pendingdelete': status}
        )

        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            logger.info(
                f"Successfully updated item with ID: {item_id} to status: {status}")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Item status updated to "pending delete"',
                    'itemId': item_id
                })
            }
        else:
            raise Exception("Item update failed")

    except Exception as e:
        logger.error(f"Error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': str(e)
            })
        }
