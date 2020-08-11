import googleapiclient.discovery
import googleapiclient.errors
from django.conf import settings

def perform_search(query: str, page_token=None):
    """
    Executes YouTube search request using YouTube Data API v3 and returns
    simplified list of video results.

    :param query: Query string
    :param page_token: Page token
    """
    api_service_name = "youtube"
    api_version = "v3"

    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=settings.YOUTUBE_API_KEY)

    # Execute search query
    search_request = youtube.search().list(part="snippet",
                                           maxResults=25,
                                           q=query,
                                           pageToken=page_token)
    search_result = search_request.execute()
    search_items = search_result['items']

    # Construct list of eligible video IDs
    ids = [
        item['id']['videoId'] for item in search_items
        if item['id']['kind'] == 'youtube#video'
        and item['snippet']['liveBroadcastContent'] == 'none'
    ]
    # Make request to videos() in order to retrieve the durations
    duration_request = youtube.videos().list(part='contentDetails', id=','.join(ids))
    duration_result = duration_request.execute()
    duration_items = duration_result['items']
    duration_dict = {
        item['id']: item['contentDetails']['duration']
        for item in duration_items
    }

    # Merge results into single, simplified list
    videos = [{
        'id': item['id']['videoId'],
        'title': item['snippet']['title'],
        'channel': item['snippet']['channelTitle'],
        'thumbnail': item['snippet']['thumbnails']['default']['url'],
        'duration': duration_dict[item['id']['videoId']]
    } for item in search_items
              if item['id']['kind'] == 'youtube#video' and item['snippet']
              ['liveBroadcastContent'] == 'none' and item['id']['videoId'] in duration_dict]
    next_page_token = search_result['nextPageToken']
    # Return next page token and video result
    return next_page_token, videos
