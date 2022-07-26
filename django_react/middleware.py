import os

class COEPCOOPHeadersMiddleware:
    enable_headers = bool(int(os.getenv('ENABLE_CROSS_ORIGIN_HEADERS', '0')))

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if self.enable_headers:
            response["Cross-Origin-Embedder-Policy"] = 'require-corp'
            response["Cross-Origin-Opener-Policy"] = 'same-origin'
        return response
