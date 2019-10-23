package main

import (
	"CypressTools/ezconsul/ctl"
	"CypressTools/ezconsul/env"
	"flag"
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/skratchdot/open-golang/open"
)

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

	if env.DebugMode {
		fmt.Println("=== Run in Debug Mode ===")
		e.Static("/css", "static/style.css")
		e.Static("/js", "static/script.js")
		e.Static("/vue", "static/vue.js")
		e.Static("/", "static/index.html")
	} else {
		// https://github.com/jteeuwen/go-bindata
		// go-bindata static
		e.GET("/css", css)
		e.GET("/js", js)
		e.GET("/vue", vue)
		e.GET("/", html)
		go open.Run("http://localhost:" + env.Port)
	}

	e.Logger.Fatal(e.Start(":" + env.Port))
}

// ConsulAddress - CQ9 驗證 GStoken
func ConsulAddress(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set("address", env.ConsulAddress)
		return next(c)
	}
}

func css(c echo.Context) error {

	content, err := Asset("static/style.css")
	if err != nil {
		return c.String(http.StatusOK, "not found")
	}

	return c.Blob(http.StatusOK, "text/css", content)
}

func js(c echo.Context) error {

	content, err := Asset("static/script.js")
	if err != nil {
		return c.String(http.StatusOK, "not found")
	}

	return c.Blob(http.StatusOK, "js", content)
}

func vue(c echo.Context) error {

	content, err := Asset("static/vue.js")
	if err != nil {
		return c.String(http.StatusOK, "not found")
	}

	return c.Blob(http.StatusOK, "vue", content)
}

func html(c echo.Context) error {

	content, err := Asset("static/index.html")
	if err != nil {
		return c.String(http.StatusOK, "not found")
	}

	return c.Blob(http.StatusOK, "html", content)
}
