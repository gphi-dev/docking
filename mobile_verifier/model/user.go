package model

import "time"

type User struct {
	ID           uint   `gorm:"primaryKey"`
	Phone        string `gorm:"type:varchar(50);not null"`
	GameID       string `gorm:"type:varchar(10)"`
	OTP          string `gorm:"type:varchar(6)"`
	OTPExpiresAt time.Time
	IsVerified   bool `gorm:"default:false"`
	VerifiedAt   *time.Time
	UpdatedAt    time.Time
}

// Table name override
func (User) TableName() string {
	return "usersmobile"
}
