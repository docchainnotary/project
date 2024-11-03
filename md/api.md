# DocChain Notary API Documentation

## Base URL
```
https://api.docchainnotary.com/v1
```

## Authentication
All API requests require a JWT token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Document Notarization

#### Create Document
```http
POST /documents
Content-Type: multipart/form-data
```

**Parameters:**
- `file`: Document file (required)
- `title`: Document title (required)
- `signers`: Array of signer addresses (required)
- `metadata`: Additional document metadata (optional)

**Example Request:**
```bash
curl -X POST https://api.docchainnotary.com/v1/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@contract.pdf" \
  -F "title=Sales Contract" \
  -F "signers=[\"GBXXXX\", \"GDXXXX\"]" \
  -F "metadata={\"department\": \"sales\", \"contract_type\": \"annual\"}"
```

**Example Response:**
```json
{
  "status": "success",
  "document_hash": "0x1234567890abcdef...",
  "transaction_id": "tx_123456789",
  "created_at": "2024-10-26T14:30:00Z",
  "blockchain_proof": {
    "network": "docchain",
    "block_number": "12345678",
    "timestamp": "2024-10-26T14:30:00Z"
  }
}
```

### 2. Version Management

#### Create New Version
```http
POST /documents/{document_hash}/versions
Content-Type: multipart/form-data
```

**Parameters:**
- `file`: Updated document file (required)
- `title`: Version title (required)
- `metadata`: Version metadata (optional)

**Example Request:**
```bash
curl -X POST https://api.docchainnotary.com/v1/documents/0x1234.../versions \
  -H "Authorization: Bearer <token>" \
  -F "file=@contract_v2.pdf" \
  -F "title=Sales Contract - Revised" \
  -F "metadata={\"revision\": \"2.0\", \"changes\": \"Updated terms\"}"
```

**Example Response:**
```json
{
  "status": "success",
  "version_hash": "0xabcdef1234...",
  "transaction_id": "tx_987654321",
  "timestamp": "2024-10-26T15:45:00Z"
}
```

### 3. Document Signing

#### Sign Document
```http
POST /documents/{document_hash}/signatures
Content-Type: application/json
```

**Request Body:**
```json
{
  "signature_data": "0x9876543210...",
  "claim_reference": "claim_123456789"
}
```

**Example Response:**
```json
{
  "status": "success",
  "transaction_id": "tx_567890123",
  "timestamp": "2024-10-26T16:00:00Z",
  "signature_proof": {
    "signer": "GBXXXX",
    "block_number": "12345679"
  }
}
```

### 4. Document Verification

#### Get Document History
```http
GET /documents/{document_hash}/history
```

**Example Response:**
```json
{
  "current_version": {
    "hash": "0x1234567890abcdef...",
    "title": "Sales Contract - Revised",
    "status": "APPROVED",
    "signatures": [
      {
        "signer_id": "GBXXXX",
        "timestamp": "2024-10-26T16:00:00Z",
        "transaction_id": "tx_567890123"
      }
    ]
  },
  "versions": [...],
  "blockchain_proof": {...},
  "blockchain_history": [...]
}
```

#### Verify Document
```http
POST /documents/verify
Content-Type: multipart/form-data
```

**Parameters:**
- `file`: Document to verify (required)

**Example Response:**
```json
{
  "verified": true,
  "document_hash": "0x1234567890abcdef...",
  "notarized_at": "2024-10-26T14:30:00Z",
  "status": "APPROVED",
  "signatures": [...],
  "blockchain_proof": {...}
}
```

### 5. Identity Claims

#### Register Identity Claim
```http
POST /identity/claims
Content-Type: application/json
```

**Request Body:**
```json
{
  "authority_id": "auth_123456789",
  "claim_type": "IDENTITY",
  "claim_value": "0x9876543210...",
  "expiration": "2025-10-26T00:00:00Z"
}
```

**Example Response:**
```json
{
  "status": "success",
  "claim_id": "claim_123456789",
  "expiration": "2025-10-26T00:00:00Z",
  "transaction_id": "tx_345678901"
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "details": {
      "field": "Additional error context"
    }
  }
}
```

Common Error Codes:
- `UNAUTHORIZED`: Invalid or missing authentication
- `INVALID_INPUT`: Invalid request parameters
- `DOCUMENT_NOT_FOUND`: Document hash not found
- `SIGNATURE_ERROR`: Invalid signature
- `BLOCKCHAIN_ERROR`: Blockchain transaction failed
- `IDENTITY_ERROR`: Invalid identity claim

## Rate Limits

- 100 requests per minute per IP
- 1000 requests per hour per user
- 5 concurrent requests per user

## Webhook Notifications

Configure webhooks to receive real-time updates:
```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["document.created", "document.signed", "version.created"]
}
```

Events:
- `document.created`: New document notarized
- `document.signed`: Document received new signature
- `version.created`: New version created
- `verification.completed`: Document verification completed
- `claim.expired`: Identity claim expired

## SDK Support

Official SDKs available for:
- Python
- JavaScript
- Rust
- Go

Import packages from:
```
npm install @docchainnotary/sdk
pip install docchainnotary-sdk
cargo add docchainnotary-sdk
go get github.com/docchainnotary/sdk
```

## Best Practices

1. Always verify document hash before signing
2. Keep identity claims updated
3. Include sufficient metadata for document context
4. Implement webhook error handling
5. Use appropriate content types for file uploads
6. Handle rate limits with exponential backoff
7. Maintain secure storage of API credentials
