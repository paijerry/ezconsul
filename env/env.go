package env

var (
	// ConsulAddress -
	ConsulAddress string
	Port          string
)

func init() {
	ConsulAddress = "http://127.0.0.1:8500"
	Port = ":1323"
}
