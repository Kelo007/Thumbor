package abi

import (
	"encoding/base64"

	"google.golang.org/protobuf/proto"
)

func (specs *Specs) Push(spec *Spec) {
	specs.Specs = append(specs.Specs, spec)
}

func NewSpecResize(width, height uint32, rtype Resize_ResizeType) *Spec {
	return &Spec{
		Data: &Spec_Resize{
			Resize: &Resize{
				Width:  width,
				Height: height,
				Rtype:  rtype,
			},
		},
	}
}

func NewSpecBlur(sigma float64) *Spec {
	return &Spec{
		Data: &Spec_Blur{
			Blur: &Blur{
				Sigma: sigma,
			},
		},
	}
}

func StringToSpecs(s string) (*Specs, error) {
	bytes, err := base64.URLEncoding.DecodeString(s)
	if err != nil {
		return nil, err
	}
	specs := &Specs{}
	err = proto.Unmarshal(bytes, specs)
	if err != nil {
		return nil, err
	}
	return specs, nil
}

func SpecsToString(specs *Specs) (string, error) {
	bytes, err := proto.Marshal(specs)
	if err != nil {
		return "", err
	}
	s := base64.URLEncoding.EncodeToString(bytes)
	return s, nil
}
