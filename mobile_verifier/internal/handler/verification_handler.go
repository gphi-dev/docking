package handler

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"time"

	"mobile_verifier/internal/svc"
	"mobile_verifier/model"

	"github.com/gin-gonic/gin"
)

// generateOTP creates a secure random 6-digit numeric string.
func generateOTP() string {
	b := make([]byte, 6)
	_, err := io.ReadAtLeast(rand.Reader, b, 6)
	if err != nil {
		return "123456" // Fallback code
	}
	table := [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}

// isValidPHMobile verifies if the input is a valid 11-digit PH mobile number.
func isValidPHMobile(phone string) bool {
	// Pattern: Starts with 09 followed by 9 digits.
	re := regexp.MustCompile(`^09\d{9}$`)
	return re.MatchString(phone)
}

// InitVerificationHandler handles the initial request to verify a mobile number.
// It generates an OTP, saves it to the database, and logs it to the terminal.
func InitVerificationHandler(svcCtx *svc.ServiceContext) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access."})
			return
		}

		var req struct {
			Phone string `json:"phone" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mobile number is required."})
			return
		}

		// Validate mobile number format
		if !isValidPHMobile(req.Phone) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid format. Mobile number must be 11 digits and start with '09'.",
			})
			return
		}

		var user model.User
		if err := svcCtx.DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found in the database."})
			return
		}

		// Generate OTP and set 5-minute expiration
		otp := generateOTP()
		expiresAt := time.Now().Add(5 * time.Minute)

		// Persist phone and OTP data to the database
		svcCtx.DB.Model(&user).Updates(map[string]interface{}{
			"phone":          req.Phone,
			"otp":            otp,
			"otp_expires_at": expiresAt,
		})

		// Log the OTP to the console for testing (Mocking SMS Portal)
		fmt.Printf("\n🚀 [MOCK SMS PORTAL] Outgoing OTP: %s to %s\n\n", otp, req.Phone)

		c.JSON(http.StatusOK, gin.H{
			"status":  "otp_sent",
			"message": "A verification code has been generated.",
			"phone":   req.Phone,
			"dev_otp": otp, // Exposed for development/testing purposes
		})
	}
}

// SubmitOTPHandler validates the provided OTP against the stored database value.
func SubmitOTPHandler(svcCtx *svc.ServiceContext) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access."})
			return
		}

		var req struct {
			OTP string `json:"otp" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "OTP code is required."})
			return
		}

		var user model.User
		if err := svcCtx.DB.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User record not found."})
			return
		}

		// Verify OTP matching
		if user.OTP != req.OTP {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OTP code. Please try again."})
			return
		}

		// Check for OTP expiration
		if time.Now().After(user.OTPExpiresAt) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "The OTP has expired. Please request a new one."})
			return
		}

		// Mark user as verified
		svcCtx.DB.Model(&user).Updates(map[string]interface{}{
			"is_verified": true,
			"verified_at": time.Now(),
		})

		// Construct final redirect URL
		redirectURL := fmt.Sprintf("https://your-game-url.com/play?game_id=%s", user.GameID)

		c.JSON(http.StatusOK, gin.H{
			"status":       "verified",
			"message":      "Verification successful.",
			"redirect_url": redirectURL,
		})
	}
}
