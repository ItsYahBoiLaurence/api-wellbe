API_URL="http://localhost:3000/hr-admin/employees/upload-csv"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3ZWxsYmVmb3VuZGVyQGdtYWlsLmNvbSIsImNvbXBhbnkiOiJZZWxsb3cgQ2FiIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU2NjkzMzg2LCJleHAiOjE3NTkyODUzODZ9.V8enfsAY1CK0SfayIW_GZQ10NZjDkQV96RSw553z3qY"
FILE_PATH="./invite.csv"

# Send the file with curl
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$FILE_PATH"