import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Authenticator API',
            version: '1.0.0',
            description: 'A comprehensive authentication API with JWT, user management, and dashboard features',
            contact: {
                name: 'API Support',
                email: 'support@authenticator.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://your-domain.com'
                    : `http://localhost:${process.env.PORT || 3000}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from login endpoint'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User unique identifier'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        name: {
                            type: 'string',
                            description: 'User name'
                        },

                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'name'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            minLength: 6,
                            description: 'User password (minimum 6 characters, must contain uppercase, lowercase, and number)'
                        },
                        name: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'User name'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        password: {
                            type: 'string',
                            description: 'User password'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Request success status'
                        },
                        message: {
                            type: 'string',
                            description: 'Response message'
                        },
                        statusCode: {
                            type: 'number',
                            description: 'HTTP status code'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    description: 'JWT access token'
                                },
                                user: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Request success status'
                        },
                        message: {
                            type: 'string',
                            description: 'Response message'
                        },
                        statusCode: {
                            type: 'number',
                            description: 'HTTP status code'
                        },
                        data: {
                            type: 'object',
                            description: 'Response data'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                            description: 'Request success status'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        statusCode: {
                            type: 'number',
                            description: 'HTTP status code'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        description: 'Field name with error'
                                    },
                                    message: {
                                        type: 'string',
                                        description: 'Error description'
                                    }
                                }
                            }
                        }
                    }
                },
                DashboardData: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User'
                        },
                        stats: {
                            type: 'object',
                            properties: {
                                totalLogins: {
                                    type: 'number',
                                    description: 'Total number of user logins'
                                },
                                lastLogin: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Last login timestamp'
                                }
                            }
                        }
                    }
                },
                UpdateProfileRequest: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'Updated name'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/docs/*.ts'], // Path to the API docs
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
    // Swagger UI setup
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Authenticator API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true
        }
    }));

    // JSON endpoint for API specs
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    console.log(`📚 Swagger UI available at: http://localhost:${process.env.PORT || 3000}/api-docs`);
};
