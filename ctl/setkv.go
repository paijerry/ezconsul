package ctl

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/labstack/echo"
	"github.com/paijerry/ezapi"
	"github.com/paijerry/ezconsul/env"
)

// SetKV -
func SetKV(c echo.Context) error {
	body, err := ioutil.ReadAll(c.Request().Body)
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusOK, err.Error())
	}
	rspn, err := ezapi.New().URL(env.ConsulAddress + "/v1/kv/" + c.QueryParam("k")).Raw(body).Do("PUT")
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusOK, err.Error())
	}

	if rspn.StatusCode != http.StatusOK {
		fmt.Println("http status: ", rspn.StatusCode)
		fmt.Println("consul return: ", string(rspn.Body))
		return c.String(http.StatusOK, fmt.Sprintf("http status: ", rspn.StatusCode))
	}

	return c.String(http.StatusOK, "true")
}
