package main

import (
	"CypressTools/ezconsul/ctl"
	"CypressTools/ezconsul/env"

	"github.com/labstack/echo"
)

func main() {

	e := echo.New()
	api := e.Group("/api")
	api.Use(ConsulAddress)
	api.GET("/kvtree", ctl.GetKVTree)
	api.PUT("/setkv", ctl.SetKV)
	api.PUT("/setaddress", ctl.SetAddress)

	// e.GET("/css", css)
	// e.GET("/js", js)
	// e.GET("/vue", vue)
	// e.GET("/", html)

	e.Static("/css", "static/style.css")
	e.Static("/js", "static/script.js")
	e.Static("/vue", "static/vue.js")
	e.Static("/", "static/index.html")
	//go open.Run("http://localhost" + env.Port)
	e.Logger.Fatal(e.Start(env.Port))
}

// ConsulAddress - CQ9 驗證 GStoken
func ConsulAddress(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set("address", env.ConsulAddress)
		return next(c)
	}
}
