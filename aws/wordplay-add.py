import json
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')


def lambda_handler(event=None, context=None):
    table_name = 'wordplay'
    table = dynamodb.Table(table_name)

    now = datetime.now()
    time_plus_eight = now + timedelta(hours=8)

    # Format the time as a string
    formatted_time = time_plus_eight.strftime("%Y-%m-%d %H:%M:%S")

    item = {
        'id': context.aws_request_id,  # aws auto generated uuid
        'abbreviation': event['queryStringParameters']['abbreviation'],
        'acronym': event['queryStringParameters']['acronym'],
        'by': event['queryStringParameters']['email'],
        # 'abbreviation': body['abbreviation'],
        # 'acronym': body['acronym'],
        # 'by': body['email'],
        'status': 'pending_add',
        'datetime': formatted_time
    }

    try:
        table.put_item(Item=item)
        return {
            'statusCode': 200,
            'body': json.dumps('Item added successfully')
        }
    except Exception as e:
        print(str(e))
        return {
            'statusCode': 500,
            'body': json.dumps('Error adding item')
        }
