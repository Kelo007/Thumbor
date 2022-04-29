package main

import (
	"fmt"
	"image"
	"thumbor/server/abi"

	"github.com/disintegration/imaging"
)

type Resize abi.Resize
type Blur abi.Blur

type Transformer interface {
	Transform(image.Image) image.Image
}

func (s *Resize) Transform(img image.Image) image.Image {
	fmt.Println("Resize...")
	var filter imaging.ResampleFilter
	switch s.Rtype {
	case abi.Resize_Lanczos:
		filter = imaging.Lanczos
	case abi.Resize_CatmullRom:
		filter = imaging.CatmullRom
	case abi.Resize_Linear:
		filter = imaging.Linear
	case abi.Resize_Box:
		filter = imaging.Box
	default:
		filter = imaging.Lanczos
	}
	return imaging.Resize(img, int(s.Width), int(s.Height), filter)
}
func (s *Blur) Transform(img image.Image) image.Image {
	fmt.Printf("Blur... %v\n", s.Sigma)
	return imaging.Blur(img, s.Sigma)
}

func ToTransformer(spec *abi.Spec) Transformer {
	switch s := spec.Data.(type) {
	case *abi.Spec_Blur:
		return (*Blur)(s.Blur)
	case *abi.Spec_Resize:
		return (*Resize)(s.Resize)
	default:
		return nil
	}
}
