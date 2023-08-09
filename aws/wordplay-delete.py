import boto3
import json
import logging

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('wordplay')

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    try:
        logger.info(f"Received event: {json.dumps(event)}")

        # Get the ID of the item to update
        item_id = event['queryStringParameters']['id']
        status = event['queryStringParameters']['status']

        response = table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :pendingdelete',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':pendingdelete': status}
        )

        logger.info(f"Update response: {json.dumps(response)}")

        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
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
