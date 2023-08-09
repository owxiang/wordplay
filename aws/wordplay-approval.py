import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('wordplay')


def lambda_handler(event, context):
    # Get the ID of the item to update

    item_id = event['queryStringParameters']['id']

    action = event['queryStringParameters']['action']

    status = event['queryStringParameters']['status']

    # statusCheck = status.split('-')[0].split(' ')[1]
    statusCheck = status
    print('action: ', action)
    print('status: ', status)
    print('status check: ', statusCheck)

    if action == 'approve':
        approve(item_id, statusCheck, status)

    elif action == 'reject':
        reject(item_id, statusCheck, status)


def approve(item_id, statusCheck, status):
    # if statusCheck == 'add':  # if add is approved, status changes to approved
    if 'pending_add' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :approved',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':approved': 'approved'}
        )

    # elif statusCheck == 'delete':  # if delete is approved, status changes to deleted
    elif 'pending_delete' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :deleted',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':deleted': 'deleted'}
        )

    # if UPDATE is approved, status changes to approved with changes to other fields
    # elif statusCheck == 'update':
    elif 'pending_update' in statusCheck:

        new_acronym = status.split('-')[3]
        new_abbreviation = status.split('-')[7]
        by = status.split('-')[9]
        now = datetime.now()
        # formatted_time = now.strftime("%Y-%m-%d %H:%M:%S")
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


def reject(item_id, statusCheck, status):
    # if statusCheck == 'add':  # if add is rejected, status changes to rejected
    if 'pending_add' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :rejected',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':rejected': 'rejected'}
        )

    # elif statusCheck == 'delete':  # if delete is rejected, status returns to approved
    elif 'pending_delete' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :approved',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':approved': 'approved'}
        )
    # elif statusCheck == 'update':  # if update is rejected, status returns to approved
    elif 'pending_update' in statusCheck:
        table.update_item(
            Key={'id': item_id},
            UpdateExpression='SET #status = :approved',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':approved': 'approved'}
        )
