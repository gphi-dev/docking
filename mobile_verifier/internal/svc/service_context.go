package svc

import (
	"fmt"
	"log"

	"mobile_verifier/internal/config"
	"mobile_verifier/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type ServiceContext struct {
	Config config.Config
	DB     *gorm.DB
}

func NewServiceContext(c config.Config) *ServiceContext {
	db, err := gorm.Open(mysql.Open(c.Mysql.DataSource), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}

	// 1. Auto-migrate: Gagawa na ito ng table na 'usersmobile'
	err = db.AutoMigrate(&model.User{})
	if err != nil {
		log.Printf("Warning during AutoMigrate: %v", err)
	}

	// 2. DROP INDEX FIX para sa bagong table name:
	// Ang default naming ni GORM ay idx_{tablename}_{columnname}
	newIndexName := "idx_usersmobile_phone"

	if db.Migrator().HasIndex(&model.User{}, newIndexName) {
		err := db.Migrator().DropIndex(&model.User{}, newIndexName)
		if err != nil {
			log.Printf("Failed to drop index on usersmobile: %v", err)
		} else {
			fmt.Println("[GCP DB] Unique index dropped for usersmobile table!")
		}
	}

	return &ServiceContext{
		Config: c,
		DB:     db,
	}
}
