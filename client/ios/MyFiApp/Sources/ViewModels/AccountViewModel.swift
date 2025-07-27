import Foundation
import Combine

import LinkKit

@MainActor
class AccountsViewModel: ObservableObject {
    @Published var isLinking: Bool = false
    @Published var errorMessage: String?
    @Published var accounts: [Account] = []
    @Published var plaidLinkToken: String?
    
    private let apiClient: APIClient = APIClient.shared
    
    // MARK: - Get Plaid Link Token (for UI)
    func getPlaidLinkToken() async throws -> String? {
        isLinking = true
        errorMessage = nil
        do {
            let linkTokenResponse: LinkTokenResponse = try await apiClient.createLinkToken()
            return linkTokenResponse.linkToken
        } catch {
            errorMessage = error.localizedDescription
            isLinking = false
            return nil
        }
    }

    // MARK: - Handle Plaid Success
    func handlePlaidSuccess(publicToken: String, success: LinkSuccess) async {
        isLinking = true
        errorMessage = nil
        do {
            // Convert Plaid SDK metadata to PlaidMetadata for backend
            let sdk: SuccessMetadata = success.metadata
            // Assume sdk.institution is NOT optional and has .name and .id
            let institution: PlaidInstitution = PlaidInstitution(name: sdk.institution.name, institutionId: sdk.institution.id)
            // Assume sdk.accounts is [Account] and each account has .id, .name, .mask, .type, .subtype, .verificationStatus
            let accounts: [Account] = sdk.accounts.map { account     in
                Account(
                    id: account.id,
                    name: account.name, 
                    mask: account.mask,
                    type: String(describing: account.subtype),
                    subtype: String(describing: account.subtype),
                    verificationStatus: String(describing: account.verificationStatus)
                )
            }
            let metadata: PlaidMetadata = PlaidMetadata(
                institution: institution,
                accounts: accounts,
                linkSessionId: nil // Remove or set if available in sdk
            )
            let _ = try await apiClient.exchangePublicToken(publicToken, metadata: metadata)
            // Optionally refresh accounts here
            await fetchAccounts()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLinking = false
    }
    
    // MARK: - Fetch Accounts
    func fetchAccounts() async {
        // TODO: Implement fetching accounts from backend
    }
}


