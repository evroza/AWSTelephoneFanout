# Telephone Fanout - AWS

> Laying out components on in the Service!

![Implemented Fanout Architecture for Telephones!](https://bn1301files.storage.live.com/y4mkhL4UE4G4HjFOPGeC6tTU-GikigYTMSGBIi1qFPI2TRpidSFVz49ZF71YTR1LdFQ4SGf84SkTjSwFInsrRTHHbSa6LIfR_2kbZYSvU3y6B7XuDjA-cI2_SIcq8qN9Xxd7eBzL3T2B67GIm_o6NiM9GOPSP-ZQVVirGm9VoLoIAsMrTCTVO0EfGxRfH2Wa6X9/fanoutArchitecture.png?psid=1&width=953&height=507)

This project uses JSON Web Tokens (JWTs.) for authentication

It has the following lambda endpoints:

- `GET /unprotected` is a public endpoint anyone can access.
- `GET /protected` is a private endpoint, protected by an AWS Custom Authorizer.
- `POST /sessions` is a login endpoint. Pass a valid username and password in a JSON request body to get a JWT (see `/lib/users.js` for valid combinations.) For example:

```
{
	"username": "Cthon98",
	"password": "hunter2"
}
```

In order to pass the *authentication* check, you will need to supply a valid JWT in your `Authorization` request header when making calls to a protected endpoint.

In order to pass the *authorization* check, you will need a JWT belonging to a user with valid permissions. For this example, the user `Cthon98` is authorized to access `GET /pangolins`; `AzureDiamond` is not.

## Setup

### Prerequisites

- Node.js & NPM
- Yarn
- [The Serverless Framework](https://serverless.com/framework/)

### Install dependencies

```
yarn
```

### Running Tests

```
yarn test
```

### Get Test coverage

```
yarn test:coverage
```

### Lint

```
yarn eslint
```

### Running locally
```
serverless offline start
```

### Deploy

```
serverless deploy
```
