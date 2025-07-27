import Foundation

class APIClient {
    static let shared = APIClient()
    
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    private init() {
        // TODO: Update this URL based on your server configuration
        // Use local IP instead of localhost for iOS simulator
        // FORCING CHANGE TO CONFIRM CODE IS ACTIVE - FIXED ROUTING
        self.baseURL = URL(string: "http://192.168.1.146:3001")!
        
        // SUPER VISIBLE DEBUG MESSAGE
        NSLog("🔥🔥🔥 APIClient initialized with baseURL: \(baseURL.absoluteString) 🔥🔥🔥")
        NSLog("🔥🔥🔥 THIS CONFIRMS OUR CODE CHANGES ARE ACTIVE 🔥🔥🔥")
        NSLog("🔥🔥🔥 IF YOU SEE LOCALHOST IN LOGS, CODE NOT UPDATED 🔥🔥🔥")
        print("🔥🔥🔥 APIClient initialized with baseURL: \(baseURL.absoluteString) 🔥🔥🔥")
        print("🔥🔥🔥 THIS CONFIRMS OUR CODE CHANGES ARE ACTIVE 🔥🔥🔥")
        print("🔥🔥🔥 IF YOU SEE LOCALHOST IN LOGS, CODE NOT UPDATED 🔥🔥🔥")
        
        let config: URLSessionConfiguration = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
        
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()

        // Custom ISO8601 formatter to handle fractional seconds (milliseconds)
        let iso8601Formatter: ISO8601DateFormatter = ISO8601DateFormatter()
        iso8601Formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        decoder.dateDecodingStrategy = .custom { decoder in
            let container: any SingleValueDecodingContainer = try decoder.singleValueContainer()
            let dateString: String = try container.decode(String.self)
            if let date: Date = iso8601Formatter.date(from: dateString) {
                return date
            } else {
                // Defensive fallback: try parsing without fractional seconds in case the input is a non-standard ISO8601 string or the formatter fails unexpectedly
                let fallbackFormatter: ISO8601DateFormatter = ISO8601DateFormatter()
                fallbackFormatter.formatOptions = [.withInternetDateTime]
                if let date: Date = fallbackFormatter.date(from: dateString) {
                    return date
                }
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid ISO8601 date: \(dateString)")
            }
        }
        encoder.dateEncodingStrategy = .custom { date, encoder in
            var container = encoder.singleValueContainer()
            let dateString = iso8601Formatter.string(from: date)
            try container.encode(dateString)
        }
    }
    
    // MARK: - Generic Request Method
    private func makeRequest<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Codable? = nil,
        responseType: T.Type
    ) async throws -> T {
        // Construct the full URL by appending endpoint to baseURL
        let fullURLString = baseURL.absoluteString + endpoint
        guard let url = URL(string: fullURLString) else {
            throw APIClientError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add authorization header if token exists
        if let token = KeychainManager.shared.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add request body if provided
        if let body = body {
            do {
                request.httpBody = try encoder.encode(body)
            } catch {
                throw APIClientError.encodingError(error)
            }
        }
        
        do {
            // Debug logging
            NSLog("🔥🔥🔥 MAKING API REQUEST 🔥🔥🔥")
            NSLog("🌐 Making request to: \(request.url?.absoluteString ?? "unknown")")
            NSLog("🌐 HTTP Method: \(request.httpMethod ?? "unknown")")
            print("🔥🔥🔥 MAKING API REQUEST 🔥🔥🔥")
            print("🌐 Making request to: \(request.url?.absoluteString ?? "unknown")")
            print("🌐 HTTP Method: \(request.httpMethod ?? "unknown")")
            if let body = request.httpBody, let bodyString = String(data: body, encoding: .utf8) {
                NSLog("🌐 Request Body: \(bodyString)")
                print("🌐 Request Body: \(bodyString)")
            }
            NSLog("🔥🔥🔥 STARTING NETWORK CALL 🔥🔥🔥")
            print("🔥🔥🔥 STARTING NETWORK CALL 🔥🔥🔥")
            
            let (data, response) = try await session.data(for: request)
            
            // Debug logging for response
            NSLog("🔥🔥🔥 RECEIVED API RESPONSE 🔥🔥🔥")
            print("🔥🔥🔥 RECEIVED API RESPONSE 🔥🔥🔥")
            if let httpResponse = response as? HTTPURLResponse {
                NSLog("🌐 Response Status: \(httpResponse.statusCode)")
                print("🌐 Response Status: \(httpResponse.statusCode)")
                NSLog("🌐 Response Headers: \(httpResponse.allHeaderFields)")
                print("🌐 Response Headers: \(httpResponse.allHeaderFields)")
                if let responseString = String(data: data, encoding: .utf8) {
                    NSLog("🌐 Response Body: \(responseString)")
                    print("🌐 Response Body: \(responseString)")
                } else {
                    NSLog("🌐 Response Body: Could not decode as UTF-8")
                    print("🌐 Response Body: Could not decode as UTF-8")
                }
            } else {
                NSLog("🔥 ERROR: Response is not HTTPURLResponse")
                print("🔥 ERROR: Response is not HTTPURLResponse")
            }
            NSLog("🔥🔥🔥 RESPONSE LOGGING COMPLETE 🔥🔥🔥")
            print("🔥🔥🔥 RESPONSE LOGGING COMPLETE 🔥🔥🔥")
            
            guard let httpResponse = response as? HTTPURLResponse else {
                NSLog("🔥 ERROR: Throwing invalidResponse error")
                print("🔥 ERROR: Throwing invalidResponse error")
                throw APIClientError.invalidResponse
            }
            
            NSLog("🔥 Processing status code: \(httpResponse.statusCode)")
            print("🔥 Processing status code: \(httpResponse.statusCode)")
            
            // Handle different status codes
            switch httpResponse.statusCode {
            case 200...299:
                // Success - decode response
                NSLog("🔥 SUCCESS: Status code \(httpResponse.statusCode), attempting to decode")
                print("🔥 SUCCESS: Status code \(httpResponse.statusCode), attempting to decode")
                do {
                    let result = try decoder.decode(responseType, from: data)
                    NSLog("🔥 SUCCESS: Decoding completed successfully")
                    print("🔥 SUCCESS: Decoding completed successfully")
                    return result
                } catch {
                    NSLog("🔥 ERROR: Decoding failed: \(error)")
                    print("🔥 ERROR: Decoding failed: \(error)")
                    throw APIClientError.decodingError(error)
                }
                
            case 401:
                NSLog("🔥 ERROR: Unauthorized (401)")
                print("🔥 ERROR: Unauthorized (401)")
                // Unauthorized - clear token and throw error
                KeychainManager.shared.deleteToken()
                throw APIClientError.unauthorized
                
            case 400...499:
                NSLog("🔥 ERROR: Client error (\(httpResponse.statusCode))")
                print("🔥 ERROR: Client error (\(httpResponse.statusCode))")
                // Client error - try to decode error message
                if let errorResponse = try? decoder.decode(APIError.self, from: data) {
                    throw APIClientError.serverError(errorResponse)
                } else {
                    throw APIClientError.clientError(httpResponse.statusCode)
                }
                
            case 500...599:
                NSLog("🔥 ERROR: Server error (\(httpResponse.statusCode))")
                print("🔥 ERROR: Server error (\(httpResponse.statusCode))")
                // Server error
                if let errorResponse = try? decoder.decode(APIError.self, from: data) {
                    throw APIClientError.serverError(errorResponse)
                } else {
                    throw APIClientError.serverError(APIError(message: "Server error", errorType: nil, errorCode: nil, displayMessage: nil, requestId: nil))
                }
                
            default:
                NSLog("🔥 ERROR: Unknown status code (\(httpResponse.statusCode))")
                print("🔥 ERROR: Unknown status code (\(httpResponse.statusCode))")
                throw APIClientError.unknownError(httpResponse.statusCode)
            }
        } catch {
            if error is APIClientError {
                throw error
            } else {
                throw APIClientError.networkError(error)
            }
        }
    }
}

// MARK: - Authentication Methods
extension APIClient {
    func login(email: String, password: String) async throws -> AuthResponse {
        let loginRequest = LoginRequest(email: email, password: password)
        return try await makeRequest(
            endpoint: "/api/auth/login",
            method: .POST,
            body: loginRequest,
            responseType: AuthResponse.self
        )
    }
    
    func signup(email: String, password: String) async throws -> AuthResponse {
        let signupRequest = SignupRequest(email: email, password: password)
        return try await makeRequest(
            endpoint: "/api/auth/signup",
            method: .POST,
            body: signupRequest,
            responseType: AuthResponse.self
        )
    }
    
    func getCurrentUser() async throws -> User {
        return try await makeRequest(
            endpoint: "/api/auth/me",
            method: .GET,
            responseType: User.self
        )
    }
    
    func logout() async throws {
        _ = try await makeRequest(
            endpoint: "/api/auth/logout",
            method: .POST,
            responseType: MessageResponse.self
        )
        // Clear local token
        KeychainManager.shared.deleteToken()
    }
}

// MARK: - Plaid Methods
extension APIClient {
    func createLinkToken() async throws -> LinkTokenResponse {
        return try await makeRequest(
            endpoint: "/api/plaid/create-link-token",
            method: .POST,
            body: EmptyRequest(),
            responseType: LinkTokenResponse.self
        )
    }
    
    func exchangePublicToken(_ publicToken: String, metadata: PlaidMetadata) async throws -> MessageResponse {
        let request: ExchangeTokenRequest = ExchangeTokenRequest(publicToken: publicToken, metadata: metadata)
        return try await makeRequest(
            endpoint: "/api/plaid/exchange-public-token",
            method: .POST,
            body: request,
            responseType: MessageResponse.self
        )
    }
    
    func getPlaidItems() async throws -> [PlaidItem] {
        let response = try await makeRequest(
            endpoint: "/api/plaid/items",
            method: .GET,
            responseType: PlaidItemsResponse.self
        )
        return response.plaidItems
    }
    
    func deletePlaidItem(plaidItemId: String) async throws -> MessageResponse {
        return try await makeRequest(
            endpoint: "/api/plaid/items/\(plaidItemId)",
            method: .DELETE,
            responseType: MessageResponse.self
        )
    }
    
    func getTransactions(
        plaidItemId: String,
        startDate: Date? = nil,
        endDate: Date? = nil,
        accountIds: [String]? = nil,
        count: Int = 100,
        offset: Int = 0
    ) async throws -> TransactionsResponse {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "plaidItemId", value: plaidItemId),
            URLQueryItem(name: "count", value: String(count)),
            URLQueryItem(name: "offset", value: String(offset))
        ]
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        
        if let startDate = startDate {
            queryItems.append(URLQueryItem(name: "startDate", value: dateFormatter.string(from: startDate)))
        }
        
        if let endDate = endDate {
            queryItems.append(URLQueryItem(name: "endDate", value: dateFormatter.string(from: endDate)))
        }
        
        if let accountIds = accountIds {
            for accountId in accountIds {
                queryItems.append(URLQueryItem(name: "account_ids", value: accountId))
            }
        }
        
        var urlComponents = URLComponents()
        urlComponents.queryItems = queryItems
        let queryString = urlComponents.percentEncodedQuery ?? ""
        
        return try await makeRequest(
            endpoint: "/api/plaid/transactions?\(queryString)",
            method: .GET,
            responseType: TransactionsResponse.self
        )
    }
}

// MARK: - Category Methods
extension APIClient {
    func getCategories() async throws -> [Category] {
        return try await makeRequest(
            endpoint: "/api/categories",
            method: .GET,
            responseType: [Category].self
        )
    }
    
    func createCategory(name: String) async throws -> Category {
        let request = CreateCategoryRequest(name: name)
        return try await makeRequest(
            endpoint: "/api/categories",
            method: .POST,
            body: request,
            responseType: Category.self
        )
    }
    
    func updateCategory(id: Int, name: String) async throws -> Category {
        let request = UpdateCategoryRequest(name: name)
        return try await makeRequest(
            endpoint: "/api/categories/\(id)",
            method: .PUT,
            body: request,
            responseType: Category.self
        )
    }
    
    func deleteCategory(id: Int) async throws -> MessageResponse {
        return try await makeRequest(
            endpoint: "/api/categories/\(id)",
            method: .DELETE,
            responseType: MessageResponse.self
        )
    }
}

// MARK: - Transaction Category Methods
extension APIClient {
    func linkTransactionToCategory(transactionId: Int, categoryId: Int) async throws -> MessageResponse {
        let request = LinkCategoryRequest(categoryId: categoryId)
        return try await makeRequest(
            endpoint: "/api/transactions/\(transactionId)/categories",
            method: .POST,
            body: request,
            responseType: MessageResponse.self
        )
    }
    
    func unlinkTransactionFromCategory(transactionId: Int, categoryId: Int) async throws -> MessageResponse {
        return try await makeRequest(
            endpoint: "/api/transactions/\(transactionId)/categories/\(categoryId)",
            method: .DELETE,
            responseType: MessageResponse.self
        )
    }
}

// MARK: - Supporting Types
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
}

enum APIClientError: Error, LocalizedError {
    case invalidURL
    case encodingError(Error)
    case decodingError(Error)
    case networkError(Error)
    case invalidResponse
    case unauthorized
    case clientError(Int)
    case serverError(APIError)
    case unknownError(Int)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .encodingError(let error):
            return "Encoding error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response"
        case .unauthorized:
            return "Unauthorized - please log in again"
        case .clientError(let code):
            return "Client error: \(code)"
        case .serverError(let apiError):
            return apiError.displayMessage ?? apiError.message
        case .unknownError(let code):
            return "Unknown error: \(code)"
        }
    }
}

// MARK: - Request Models
private struct LoginRequest: Codable {
    let email: String
    let password: String
}

private struct SignupRequest: Codable {
    let email: String
    let password: String
}

private struct EmptyRequest: Codable {}

private struct LinkCategoryRequest: Codable {
    let categoryId: Int
}
