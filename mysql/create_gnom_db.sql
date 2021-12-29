-- MySQL Script generated by MySQL Workbench
-- Wed Dec 29 12:24:21 2021
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema gnom_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema gnom_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gnom_db` ;
USE `gnom_db` ;

-- -----------------------------------------------------
-- Table `gnom_db`.`taxa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`taxa` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ncbiTaxonID` INT UNSIGNED NOT NULL,
  `parentNcbiTaxonID` INT UNSIGNED NOT NULL,
  `scientificName` VARCHAR(200) NOT NULL,
  `taxonRank` VARCHAR(25) NOT NULL,
  `lastUpdatedBy` BIGINT UNSIGNED NOT NULL,
  `lastUpdatedOn` TIMESTAMP NOT NULL,
  `imagePath` VARCHAR(260) NULL,
  `commonName` VARCHAR(200) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`taxaGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`taxaGeneralInfo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `taxonID` BIGINT UNSIGNED NOT NULL,
  `generalInfoLabel` VARCHAR(50) NOT NULL,
  `generalInfoDescription` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `taxonRefGeneralInfo_idx` (`taxonID` ASC) VISIBLE,
  CONSTRAINT `taxaRefGeneralInfo`
    FOREIGN KEY (`taxonID`)
    REFERENCES `gnom_db`.`taxa` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`assemblies`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`assemblies` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `taxonID` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `path` VARCHAR(260) NOT NULL,
  `addedBy` BIGINT UNSIGNED NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  `lastUpdatedBy` BIGINT UNSIGNED NOT NULL,
  `lastUpdatedOn` TIMESTAMP NOT NULL,
  `numberOfSequences` INT UNSIGNED NOT NULL,
  `sequenceType` VARCHAR(10) NOT NULL,
  `cumulativeSequenceLength` BIGINT UNSIGNED NOT NULL,
  `n50` BIGINT UNSIGNED NOT NULL,
  `n90` BIGINT UNSIGNED NOT NULL,
  `shortestSequence` BIGINT UNSIGNED NOT NULL,
  `largestSequence` BIGINT UNSIGNED NOT NULL,
  `meanSequence` BIGINT UNSIGNED NOT NULL,
  `medianSequence` BIGINT UNSIGNED NOT NULL,
  `gcPercent` FLOAT UNSIGNED NOT NULL,
  `gcPercentMasked` FLOAT UNSIGNED NOT NULL,
  `lengthDistributionString` JSON NOT NULL,
  `charCountString` JSON NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `assemblyName_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `assemblyIDtaxonID_idx` (`taxonID` ASC) VISIBLE,
  CONSTRAINT `assemblyIDtaxonID`
    FOREIGN KEY (`taxonID`)
    REFERENCES `gnom_db`.`taxa` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`assembliesGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`assembliesGeneralInfo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `generalInfoLabel` VARCHAR(50) NOT NULL,
  `generalInfoDescription` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyIDassemblyGeneralInfo_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `AssembliesGeneralInfoIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`genomicAnnotations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`genomicAnnotations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `path` VARCHAR(260) NOT NULL,
  `addedBy` BIGINT UNSIGNED NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyAnnotationID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `genomicAnnotationIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`genomicAnnotationsGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`genomicAnnotationsGeneralInfo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `annotationID` BIGINT UNSIGNED NOT NULL,
  `generalInfoLabel` VARCHAR(50) NOT NULL,
  `generalInfoDescription` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyIDassemblyGeneralInfo_idx` (`annotationID` ASC) VISIBLE,
  CONSTRAINT `genomicAnnotationsGeneralInfoIDgenomicAnnotationID`
    FOREIGN KEY (`annotationID`)
    REFERENCES `gnom_db`.`genomicAnnotations` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`references`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`references` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `taxonID` BIGINT UNSIGNED NOT NULL,
  `path` VARCHAR(260) NOT NULL,
  `referenceSource` VARCHAR(260) NOT NULL,
  `addedBy` BIGINT UNSIGNED NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `referenceTaxaID_idx` (`taxonID` ASC) VISIBLE,
  CONSTRAINT `referenceTaxaID`
    FOREIGN KEY (`taxonID`)
    REFERENCES `gnom_db`.`taxa` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`analyses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`analyses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `path` VARCHAR(260) NOT NULL,
  `type` VARCHAR(25) NOT NULL,
  `addedBy` BIGINT UNSIGNED NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyAnalysisID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `AnalysisIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`analysesBusco`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`analysesBusco` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `analysisID` BIGINT UNSIGNED NOT NULL,
  `completeSingle` INT UNSIGNED NOT NULL,
  `completeDuplicated` INT UNSIGNED NOT NULL,
  `fragmented` INT UNSIGNED NOT NULL,
  `missing` INT UNSIGNED NOT NULL,
  `total` INT UNSIGNED NOT NULL,
  `completeSinglePercent` FLOAT UNSIGNED NOT NULL,
  `completeDuplicatedPercent` FLOAT UNSIGNED NOT NULL,
  `fragmentedPercent` FLOAT UNSIGNED NOT NULL,
  `missingPercent` FLOAT UNSIGNED NOT NULL,
  `dataset` VARCHAR(50) NULL,
  `buscoMode` VARCHAR(20) NULL,
  `targetFile` VARCHAR(200) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `BuscoIDAnalysisID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `gnom_db`.`analyses` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`analysisGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`analysisGeneralInfo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `analysisID` BIGINT UNSIGNED NOT NULL,
  `generalInfoLabel` VARCHAR(50) NOT NULL,
  `generalInfoDescription` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `analysisIDGeneralInfo_idx` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `AnalysisGeneralInfoIDAnalysisID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `gnom_db`.`analyses` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`analysesFcat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`analysesFcat` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `analysisID` BIGINT UNSIGNED NOT NULL,
  `m1_similar` INT NOT NULL,
  `m1_similarPercent` FLOAT NOT NULL,
  `m1_dissimilar` INT NOT NULL,
  `m1_dissimilarPercent` FLOAT NOT NULL,
  `m1_duplicated` INT NOT NULL,
  `m1_duplicatedPercent` FLOAT NOT NULL,
  `m1_missing` INT NOT NULL,
  `m1_missingPercent` FLOAT NOT NULL,
  `m1_ignored` INT NOT NULL,
  `m1_ignoredPercent` FLOAT NOT NULL,
  `m2_similar` INT NOT NULL,
  `m2_similarPercent` FLOAT NOT NULL,
  `m2_dissimilar` INT NOT NULL,
  `m2_dissimilarPercent` FLOAT NOT NULL,
  `m2_duplicated` INT NOT NULL,
  `m2_duplicatedPercent` FLOAT NOT NULL,
  `m2_missing` INT NOT NULL,
  `m2_missingPercent` FLOAT NOT NULL,
  `m2_ignored` INT NOT NULL,
  `m2_ignoredPercent` FLOAT NOT NULL,
  `m3_similar` INT NOT NULL,
  `m3_similarPercent` FLOAT NOT NULL,
  `m3_dissimilar` INT NOT NULL,
  `m3_dissimilarPercent` FLOAT NOT NULL,
  `m3_duplicated` INT NOT NULL,
  `m3_duplicatedPercent` FLOAT NOT NULL,
  `m3_missing` INT NOT NULL,
  `m3_missingPercent` FLOAT NOT NULL,
  `m3_ignored` INT NOT NULL,
  `m3_ignoredPercent` FLOAT NOT NULL,
  `m4_similar` INT NOT NULL,
  `m4_similarPercent` FLOAT NOT NULL,
  `m4_dissimilar` INT NOT NULL,
  `m4_dissimilarPercent` FLOAT NOT NULL,
  `m4_duplicated` INT NOT NULL,
  `m4_duplicatedPercent` FLOAT NOT NULL,
  `m4_missing` INT NOT NULL,
  `m4_missingPercent` FLOAT NOT NULL,
  `m4_ignored` INT NOT NULL,
  `m4_ignoredPercent` FLOAT NOT NULL,
  `total` INT NOT NULL,
  `genomeID` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  UNIQUE INDEX `m4_ignored_UNIQUE` (`m4_ignored` ASC) VISIBLE,
  CONSTRAINT `FcatIDAnalysisID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `gnom_db`.`analyses` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`mappings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`mappings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `path` VARCHAR(260) NOT NULL,
  `addedBy` BIGINT UNSIGNED NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyIDMapping_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `MappingIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`mappingsGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`mappingsGeneralInfo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mappingID` BIGINT UNSIGNED NOT NULL,
  `generalInfoLabel` VARCHAR(50) NOT NULL,
  `generalInfoDescription` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyIDassemblyGeneralInfo_idx` (`mappingID` ASC) VISIBLE,
  CONSTRAINT `MappingGeneralInfoIDMappingID`
    FOREIGN KEY (`mappingID`)
    REFERENCES `gnom_db`.`mappings` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`analysesMilts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`analysesMilts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `analysisID` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `MiltsIDAnalysisID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `gnom_db`.`analyses` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`analysesRepeatmasker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`analysesRepeatmasker` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `analysisID` BIGINT UNSIGNED NOT NULL,
  `sines` INT UNSIGNED NOT NULL,
  `sines_length` INT UNSIGNED NOT NULL,
  `lines` INT UNSIGNED NOT NULL,
  `lines_length` INT UNSIGNED NOT NULL,
  `ltr_elements` INT UNSIGNED NOT NULL,
  `ltr_elements_length` INT UNSIGNED NOT NULL,
  `dna_elements` INT UNSIGNED NOT NULL,
  `dna_elements_length` INT UNSIGNED NOT NULL,
  `unclassified` INT UNSIGNED NOT NULL,
  `unclassified_length` INT UNSIGNED NOT NULL,
  `rolling_circles` INT UNSIGNED NOT NULL,
  `rolling_circles_length` INT UNSIGNED NOT NULL,
  `small_rna` INT UNSIGNED NOT NULL,
  `small_rna_length` INT UNSIGNED NOT NULL,
  `satellites` INT UNSIGNED NOT NULL,
  `satellites_length` INT UNSIGNED NOT NULL,
  `simple_repeats` INT UNSIGNED NOT NULL,
  `simple_repeats_length` INT UNSIGNED NOT NULL,
  `low_complexity` INT UNSIGNED NOT NULL,
  `low_complexity_length` INT UNSIGNED NOT NULL,
  `total_non_repetitive_length` INT UNSIGNED NOT NULL,
  `total_repetitive_length` INT UNSIGNED NOT NULL,
  `numberN` INT UNSIGNED NOT NULL,
  `percentN` FLOAT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `RepeatmaskerIDAnalysisID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `gnom_db`.`analyses` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`assembliesSequences`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`assembliesSequences` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `header` VARCHAR(200) NOT NULL,
  `headerIdx` INT UNSIGNED NOT NULL,
  `sequenceLength` INT UNSIGNED NOT NULL,
  `gcPercentLocal` FLOAT UNSIGNED NOT NULL,
  `gcPercentMaskedLocal` FLOAT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyStatisticsIDassemblyID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `AssembliesSequencesIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`genomicAnnotationFeatures`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`genomicAnnotationFeatures` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `annotationID` BIGINT UNSIGNED NOT NULL,
  `seqID` VARCHAR(200) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `start` BIGINT UNSIGNED NOT NULL,
  `end` BIGINT UNSIGNED NOT NULL,
  `attributes` JSON NOT NULL,
  `source` VARCHAR(50) NULL,
  `score` FLOAT NULL,
  `strand` VARCHAR(1) NULL,
  `phase` TINYINT NULL,
  PRIMARY KEY (`id`),
  INDEX `AssembliesStatisticsIDAssemblyID_idx` (`annotationID` ASC) VISIBLE,
  CONSTRAINT `genomicAnnotationSequenceIDAssemblyID`
    FOREIGN KEY (`annotationID`)
    REFERENCES `gnom_db`.`genomicAnnotations` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`userGroups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`userGroups` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`userGroupRefAssembly`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`userGroupRefAssembly` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `groupID` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `groupRefAssemblyID_idx` (`assemblyID` ASC) VISIBLE,
  INDEX `groupRefGroupIDGroup_idx` (`groupID` ASC) VISIBLE,
  CONSTRAINT `groupRefAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `groupRefGroupIDGroup`
    FOREIGN KEY (`groupID`)
    REFERENCES `gnom_db`.`userGroups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`globalStatistics`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`globalStatistics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `statisticsLabel` VARCHAR(50) NOT NULL,
  `statisticsValue` VARCHAR(500) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `userRole` VARCHAR(20) NOT NULL DEFAULT 'admin',
  `activeToken` VARCHAR(200) NULL DEFAULT NULL,
  `tokenCreationTime` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) INVISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`bookmarks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`bookmarks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userID` BIGINT UNSIGNED NOT NULL,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `userIDSubscription_idx` (`userID` ASC) VISIBLE,
  INDEX `bookmarkIDAssemblyID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `userIDSubscription`
    FOREIGN KEY (`userID`)
    REFERENCES `gnom_db`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `bookmarkIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`userGroupRefUser`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`userGroupRefUser` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userID` BIGINT UNSIGNED NOT NULL,
  `groupID` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `userRefUserID_idx` (`userID` ASC) VISIBLE,
  INDEX `userRefGroupIDUser_idx` (`groupID` ASC) VISIBLE,
  CONSTRAINT `userRefUserID`
    FOREIGN KEY (`userID`)
    REFERENCES `gnom_db`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `userRefGroupIDUser`
    FOREIGN KEY (`groupID`)
    REFERENCES `gnom_db`.`userGroups` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gnom_db`.`tags`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gnom_db`.`tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `assemblyID` BIGINT UNSIGNED NOT NULL,
  `tag` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `tagIDAssemblyID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `tagIDAssemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `gnom_db`.`assemblies` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `gnom_db`.`userGroups`
-- -----------------------------------------------------
START TRANSACTION;
USE `gnom_db`;
INSERT INTO `gnom_db`.`userGroups` (`id`, `name`) VALUES (DEFAULT, 'all');

COMMIT;


-- -----------------------------------------------------
-- Data for table `gnom_db`.`users`
-- -----------------------------------------------------
START TRANSACTION;
USE `gnom_db`;
INSERT INTO `gnom_db`.`users` (`id`, `username`, `password`, `userRole`, `activeToken`, `tokenCreationTime`) VALUES (DEFAULT, 'admin', 'd987f042a7945828cc9425c13c1e688abf953efccbf34df492552a05d7bbe934a696501851f16616e5e527627d97f1dde346eb1d62d7f11bf929de7d33e8e3eb', 'admin', NULL, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `gnom_db`.`userGroupRefUser`
-- -----------------------------------------------------
START TRANSACTION;
USE `gnom_db`;
INSERT INTO `gnom_db`.`userGroupRefUser` (`id`, `userID`, `groupID`) VALUES (DEFAULT, 1, 1);

COMMIT;

USE `gnom_db`;

DELIMITER $$
USE `gnom_db`$$
CREATE DEFINER = CURRENT_USER TRIGGER `gnom_db`.`assemblies_AFTER_INSERT` AFTER INSERT ON `assemblies` FOR EACH ROW
BEGIN
	INSERT INTO `gnom_db`.`userGroupRefAssembly` (assemblyID, groupID) VALUES (NEW.id, 1);
END$$


DELIMITER ;
