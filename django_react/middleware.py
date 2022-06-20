class COEPCOOPHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Cross-Origin-Embedder-Policy"] = 'require-corp'
        response["Cross-Origin-Opener-Policy"] = 'same-origin'
        return response
