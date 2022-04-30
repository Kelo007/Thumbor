package main

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	"image/png"
	"net/http"
	"net/url"
	"thumbor/server/abi"
	"time"

	"github.com/gin-contrib/cache"
	"github.com/gin-contrib/cache/persistence"
	"github.com/gin-gonic/gin"
	lru "github.com/hashicorp/golang-lru"
)

const cachePath string = "cache"

var imageCache *lru.ARCCache

func init() {
	var err error
	imageCache, err = lru.NewARC(32)
	if err != nil {
		panic(err)
	}
}

func getImage(url string) (image.Image, error) {
	if img, ok := imageCache.Get(url); ok {
		return img.(image.Image), nil
	}
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	img, _, err := image.Decode(resp.Body)
	if err != nil {
		return nil, err
	}
	imageCache.Add(url, img)
	return img, nil
}

func getImgbuf(img image.Image) (*bytes.Buffer, string) {
	buf := &bytes.Buffer{}
	png.Encode(buf, img)
	return buf, "image/png"
}

func printTestUrl() {
	url := url.QueryEscape("http://localhost:8080/image/cache")
	specs := &abi.Specs{}
	specs.Push(abi.NewSpecResize(1000, 1000, abi.Resize_Lanczos))
	specs.Push(abi.NewSpecBrightness(1))
	specs.Push(abi.NewSpecContrast(1))
	specs.Push(abi.NewSpecGamma(1))
	specs.Push(abi.NewSpecBlur(1))
	specs_string, _ := abi.SpecsToString(specs)
	fmt.Printf("http://localhost:8080/image/%v/%v\n", specs_string, url)
}

func addImageRoup(r *gin.Engine) {
	g := r.Group("/image")

	printTestUrl()

	store := persistence.NewInMemoryStore(time.Second)

	g.GET("/cache", func(c *gin.Context) {
		c.File(fmt.Sprintf("%v/wallpaper.jpg", cachePath))
	})

	g.GET("/cache/:filename", func(c *gin.Context) {
		filename := c.Param("filename")
		c.File(fmt.Sprintf("%v/%v", cachePath, filename))
	})

	g.POST("/cache", func(c *gin.Context) {
		c.String(http.StatusOK, "not implemented")
	})

	g.GET("/:specs/*url", cache.CachePage(store, time.Minute, func(c *gin.Context) {
		specs, err := abi.StringToSpecs(c.Param("specs"))
		if err != nil {
			c.String(http.StatusBadRequest, err.Error())
			return
		}
		// url is like "/http://..."
		// so remove the first slash
		url := c.Param("url")[1:]
		fmt.Println(specs)
		fmt.Println(url)
		img, err := getImage(url)
		if err != nil {
			c.String(http.StatusBadRequest, err.Error())
			return
		}
		if img == nil {
			c.String(http.StatusBadRequest, err.Error())
			return
		}

		for _, spec := range specs.GetSpecs() {
			t := ToTransformer(spec)
			img = t.Transform(img)
		}

		buf, format := getImgbuf(img)
		c.DataFromReader(200, int64(buf.Len()), format, buf, nil)
	}))
}
