import json
import boto3

dynamodb = boto3.resource('dynamodb')
try:
    table = dynamodb.Table('wordplay')
except dynamodb.meta.client.exceptions.ResourceNotFoundException:
    print("Table does not exist")
    exit(1)
except dynamodb.meta.client.exceptions.ClientError as e:
    print(e)
    exit(1)


def lambda_handler(event=None, context=None):
    try:
        response = table.scan()
        items = response['Items']
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
        return {
            'statusCode': 200,
            'body': json.dumps(items)
        }
    except dynamodb.meta.client.exceptions.DynamoDBError as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }