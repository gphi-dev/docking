package handler

import (
	"mobile_verifier/internal/middleware"
	"mobile_verifier/internal/svc"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, svcCtx *svc.ServiceContext) {
	// ⚠️ MOCK EXTERNAL API (For testing purposes only)
	r.POST("/api/test/generate-bearer", GenerateBearerHandler(svcCtx))

	// 🛡️ SECURED VERIFICATION MICROSERVICE
	api := r.Group("/api/verification")
	api.Use(middleware.Auth(svcCtx.Config.Auth.AccessSecret))
	{
		api.POST("/init", InitVerificationHandler(svcCtx))
		api.POST("/submit-otp", SubmitOTPHandler(svcCtx))
	}
}
