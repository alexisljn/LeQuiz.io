<?php


namespace PrivateApi;


use PrivateApi\Config\Config;
use PrivateApi\Router\Router;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Slim\App;
use Slim\Exception\HttpException;
use Slim\Factory\AppFactory;

class PrivateApi
{
    public static PrivateApi $static;

    private Config $config;

    private Router $router;

    private App $slim;

    public function __construct()
    {
        $this->config = new Config();

        self::$static = $this;

        $this->slim = AppFactory::create();
        $this->router = new Router($this->slim);

        $this->registerErrorMiddleware();
        $this->router->registerRoutes();
    }

    public function getConfig(): Config
    {
        return $this->config;
    }

    public function getRouter(): Router
    {
        return $this->router;
    }

    public function run()
    {
        $this->slim->run();
    }

    private function getErrorHandler(): callable
    {
        return function (
            ServerRequestInterface $request,
            \Throwable $exception,
            bool $displayErrorDetails,
            bool $logErrors,
            bool $logErrorDetails,
            ?LoggerInterface $logger = null,
        ) {
            $isHttpException = $exception instanceof HttpException;
            $defaultStatusCode = 500;

            $statusCode = $isHttpException ? $exception->getCode() : $defaultStatusCode;

            $responsePayload = [
                'status' => $statusCode,
                // TODO IF RANDOM EXCEPTIONS ARE CAUGHT BY THIS ERROR HANDLER
                'error' => $exception->getMessage(),
            ];

            if ($displayErrorDetails) {
                $responsePayload['stackTrace'] = $exception->getTrace();
            }

            $jsonEncodeFlags = JSON_UNESCAPED_UNICODE;
            if ($displayErrorDetails) {
                $jsonEncodeFlags |= JSON_PRETTY_PRINT;
            }

            $response = $this->slim->getResponseFactory()->createResponse();
            $response->getBody()->write(
                json_encode($responsePayload, $jsonEncodeFlags)
            );

            return $response
                ->withAddedHeader('Content-Type', 'application/json')
                ->withStatus($statusCode);
        };
    }

    private function registerErrorMiddleware()
    {
        $errorHandler = $this->getErrorHandler();
        $errorMiddleware = $this->slim->addErrorMiddleware($this->getConfig()->isDevMode(), true, true);
        $errorMiddleware->setDefaultErrorHandler($errorHandler);
    }
}
