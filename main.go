package main

import (
	_ "embed"
	"flag"
	"net/http"

	"github.com/labstack/echo"
	"github.com/paijerry/ezconsul/ctl"
	"github.com/paijerry/ezconsul/env"
	"github.com/skratchdot/open-golang/open"
)

//go:embed static/style.css
var css string

//go:embed static/script.js
var js string

//go:embed static/vue.js
var vue string

//go:embed static/index.html
var index string

func init() {
	flag.StringVar(&env.ConsulAddress, "c", "http://127.0.0.1:8500", "consul address")
	flag.StringVar(&env.Port, "p", "1323", "app port")
	flag.BoolVar(&env.DebugMode, "d", false, "debug mode or not")
	flag.Parse()
}

func main() {

	e := echo.New()
	api := e.Group("/api")
	api.Use(ConsulAddress)
	api.GET("/kvtree", ctl.GetKVTree)
	api.PUT("/setkv", ctl.SetKV)
	api.PUT("/setaddress", ctl.SetAddress)

	e.GET("/css", func(c echo.Context) error {
		return c.Blob(http.StatusOK, "text/css", []byte(css))
	})

	e.GET("/js", func(c echo.Context) error {
		return c.String(http.StatusOK, js)
	})

	e.GET("/vue", func(c echo.Context) error {
		return c.String(http.StatusOK, vue)
	})

	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, index)
	})

	go open.Run("http://localhost:" + env.Port)
	e.Logger.Fatal(e.Start(":" + env.Port))
}

// ConsulAddress - CQ9 驗證 GStoken
func ConsulAddress(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set("address", env.ConsulAddress)
		return next(c)
	}
}
