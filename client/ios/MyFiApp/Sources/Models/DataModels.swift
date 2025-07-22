import Foundation

// MARK: - User Models
struct User: Codable, Identifiable {
    let id: Int
    let email: String
    let createdAt: Date
    let updatedAt: Date
    
    private enum CodingKeys: String, CodingKey {
        case id, email
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct AuthResponse: Codable {
    let token: String
    let user: User
    let message: String
}

// MARK: - Category Models
struct Category: Codable, Identifiable {
    let id: Int
    let name: String
    let userId: Int
    let createdAt: Date
    let updatedAt: Date
    
    private enum CodingKeys: String, CodingKey {
        case id, name
        case userId = "user_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct CreateCategoryRequest: Codable {
    let name: String
}

struct UpdateCategoryRequest: Codable {
    let name: String
}

// MARK: - Account Models
struct Account: Codable, Identifiable {
    let id: String
    let name: String
    let mask: String?
    let type: String
    let subtype: String?
    let verificationStatus: String?
    
    private enum CodingKeys: String, CodingKey {
        case id, name, mask, type, subtype
        case verificationStatus = "verification_status"
    }
}

// MARK: - Plaid Item Models
struct PlaidItem: Codable, Identifiable {
    let id: Int
    let plaidItemId: String
    let plaidInstitutionName: String
    let userId: Int
    let accounts: [Account]
    let createdAt: Date
    let updatedAt: Date
    
    private enum CodingKeys: String, CodingKey {
        case id, accounts
        case plaidItemId = "plaid_item_id"
        case plaidInstitutionName = "plaid_institution_name"
        case userId = "user_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct PlaidItemsResponse: Codable {
    let plaidItems: [PlaidItem]
}

// MARK: - Transaction Models
struct Transaction: Codable, Identifiable {
    let id: Int
    let plaidTransactionId: String
    let name: String
    let merchantName: String?
    let amount: Decimal
    let date: Date
    let plaidAccountId: String
    let plaidItemId: Int
    let userId: Int
    let categories: [Category]
    let createdAt: Date
    let updatedAt: Date
    
    private enum CodingKeys: String, CodingKey {
        case id, name, amount, date, categories
        case plaidTransactionId = "plaid_transaction_id"
        case merchantName = "merchant_name"
        case plaidAccountId = "plaid_account_id"
        case plaidItemId = "plaid_item_id"
        case userId = "user_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct TransactionsResponse: Codable {
    let data: [Transaction]
    let totalCount: Int
    let page: Int
    let pageSize: Int
    
    private enum CodingKeys: String, CodingKey {
        case data
        case totalCount = "total_count"
        case page = "page"
        case pageSize = "page_size"
    }
}

// MARK: - Plaid Link Models
struct LinkTokenResponse: Codable {
    let linkToken: String
    let expiration: Date
    let requestId: String
    
    private enum CodingKeys: String, CodingKey {
        case linkToken = "link_token"
        case expiration
        case requestId = "request_id"
    }
}

struct PlaidMetadata: Codable {
    let institution: PlaidInstitution?
    let accounts: [Account]?
    let linkSessionId: String?
    
    private enum CodingKeys: String, CodingKey {
        case institution, accounts
        case linkSessionId = "link_session_id"
    }
}

struct PlaidInstitution: Codable {
    let name: String
    let institutionId: String
    
    private enum CodingKeys: String, CodingKey {
        case name
        case institutionId = "institution_id"
    }
}

struct ExchangeTokenRequest: Codable {
    let publicToken: String
    let metadata: PlaidMetadata
    
    private enum CodingKeys: String, CodingKey {
        case publicToken = "public_token"
        case metadata
    }
}

// MARK: - API Error Models
struct APIError: Codable, Error {
    let message: String
    let errorType: String?
    let errorCode: String?
    let displayMessage: String?
    let requestId: String?
    
    private enum CodingKeys: String, CodingKey {
        case message
        case errorType = "error_type"
        case errorCode = "error_code"
        case displayMessage = "display_message"
        case requestId = "request_id"
    }
}

// MARK: - Generic Response Models
struct MessageResponse: Codable {
    let message: String
}
