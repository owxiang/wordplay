import json
import boto3
import logging
from boto3.dynamodb.conditions import Attr

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
    try:
        response = table.scan(
            FilterExpression=Attr('status').contains('pending')
        )
        items = response['Items']

        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ExclusiveStartKey=response['LastEvaluatedKey'],
                FilterExpression=Attr('status').contains('pending')
            )
            items.extend(response['Items'])

        logger.info(
            f"Total items retrieved with 'pending' status: {len(items)}")

        return {
            'statusCode': 200,
            'body': json.dumps(items)
        }
    except dynamodb.meta.client.exceptions.DynamoDBError as e:
        logger.error(f"Error scanning the table: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
