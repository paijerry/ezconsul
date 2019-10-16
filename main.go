package main

import (
	"CypressTools/ezconsul/ctl"
	"CypressTools/ezconsul/env"

	"github.com/labstack/echo"
)

func main() {

	e := echo.New()
	api := e.Group("/api")
	api.GET("/kvtree", ctl.GetKVTree)

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
