#!/bin/bash

# Get IPv4 and IPv6 addresses
echo "=== Server IP Information ==="
echo ""

echo "IPv4 Address:"
curl -4 ifconfig.me 2>/dev/null || ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -1
echo ""

echo "IPv6 Address:"
curl -6 ifconfig.me 2>/dev/null || ip -6 addr show | grep -oP '(?<=inet6\s)[\da-f:]+' | grep -v '^::1' | grep -v '^fe80' | head -1
echo ""

echo "=== Network Interfaces ==="
ip addr show
echo ""

echo "=== Testing Connectivity ==="
echo "Testing Node.js on localhost:"
curl -s http://localhost:3000 | head -5
echo ""

echo "Testing Node.js on IPv4:"
curl -4 -s http://127.0.0.1:3000 | head -5
echo ""

echo "Testing OpenLiteSpeed on IPv4:"
curl -4 -s http://localhost | head -10
echo ""

echo "=== DNS Configuration Needed ==="
echo ""
echo "For IPv4, add A record:"
echo "Type: A"
echo "Name: @"
echo "Value: [YOUR_IPV4_ADDRESS]"
echo ""
echo "For IPv6, add AAAA record:"
echo "Type: AAAA"
echo "Name: @"
echo "Value: 2a02:4780:28:15b9::1"
echo ""
echo "Also add www subdomain for both IPv4 and IPv6"
