package main

import "github.com/gin-gonic/gin"

func addWebGroup(r *gin.Engine) {
	web := r.Group("/web")
	web.Static("/", "www/build")
}
