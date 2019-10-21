package env

var (
	// ConsulAddress -
	ConsulAddress string
	// Port - app port
	Port string
	// DebugMode -
	DebugMode bool
)

func init() {
	ConsulAddress = "http://127.0.0.1:8500"
}
