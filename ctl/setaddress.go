package ctl

import (
	"CypressTools/ezconsul/env"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/labstack/echo"
)

// SetAddress -
func SetAddress(c echo.Context) error {
	body, err := ioutil.ReadAll(c.Request().Body)
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusOK, err.Error())
	}

	env.ConsulAddress = string(body)

	return c.String(http.StatusOK, "true")
}
