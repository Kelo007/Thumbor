package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	addWebGroup(r)
	addImageRoup(r)
	r.Run()
}
