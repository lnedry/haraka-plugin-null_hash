# haraka-plugin-null_hash

# null_hash

Adds a X-Null-Hash header to outbound emails to help verify the authenticity of bounce messages. The header contains an MD5 hash created from the message's From header, Date header, Message-ID, and a configured secret phrase.

This plugin works in conjunction with Haraka's Bounce plugin, which verifies the authenticity of incoming bounce messages by recreating and comparing the hash.

## Installation

```bash
cd /path/to/local/haraka
npm install haraka-plugin-null_hash
echo "null_hash" >> config/plugins
service haraka restart
```

## Configuration

Create a `config/null_hash.ini` file in your Haraka installation:
```ini
secret=secret-phrase-goes-here
```

The `secret` value should be:
- A secure, random string
- Kept private and not shared
- The same across all your outbound mail servers
- The same for the Haraka's Bounce plugin for all inbound mail servers
- Changed periodically as part of your security practices


## How it Works

For outbound messages, this plugin:
1. Extracts the From header, Date header, and Message-ID
2. Combines these values with your configured secret phrase
3. Creates an MD5 hash of the combined string
4. Adds the hash as an X-Null-Hash header

When a bounce message is received, Haraka's Bounce plugin will:
1. Extract the same headers from the bounced message
2. Recreate the hash using the same method
3. Compare it with the X-Null-Hash header found in the bounce message
4. Reject the bounce if the hashes don't match
