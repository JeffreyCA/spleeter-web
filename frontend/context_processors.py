import os

def debug(context):
    return {'DJANGO_DEVELOPMENT': os.getenv('DJANGO_DEVELOPMENT')}
