package main

import (
	"fmt"

	"mobile_verifier/internal/config"
	"mobile_verifier/internal/handler"
	"mobile_verifier/internal/svc"

	"github.com/gin-gonic/gin"
	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/core/logx"
)

func main() {
	// 1. Load config galing sa etc/ folder
	var c config.Config
	conf.MustLoad("etc/mobile_verifier.yaml", &c)

	// 2. Setup go-zero logger
	logx.MustSetup(logx.LogConf{
		ServiceName: c.Name,
		Mode:        "console",
	})
	defer logx.Close()

	// 3. Initialize Service Context (hawak ang config at GORM DB)
	svcCtx := svc.NewServiceContext(c)

	// 4. Setup Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	// 5. Setup Routes
	handler.SetupRoutes(r, svcCtx)

	// 6. Start Server
	logx.Infof("🚀 %s running on port %d", c.Name, c.Port)
	r.Run(fmt.Sprintf(":%d", c.Port))
}
