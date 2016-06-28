//
//  RecruiterHomeViewController.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "ListBusinesses.h"
#import "SimpleListCell.h"
#import "ListLocations.h"
#import "CreateRecruiterProfile.h"

@interface ListBusinesses () {
    NSArray *data;
}

@end

@implementation ListBusinesses

- (void)viewDidLoad {
    [super viewDidLoad];
    self.businesses.dataSource = self;
    self.businesses.delegate = self;
    self.businesses.allowsMultipleSelectionDuringEditing = NO;
}

-(void)viewWillAppear:(BOOL)animated {
    [self showProgress:true];
    [self.appDelegate.api loadBusinesses:^(NSArray *businesses) {
        [self showProgress:false];
        data = businesses;
        [self.businesses reloadData];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [[[UIAlertView alloc] initWithTitle:@"Error"
                                    message:@"Error loading data"
                                   delegate:self
                          cancelButtonTitle:@"Okay"
                          otherButtonTitles:nil] show];
    }];
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    return 85;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return data ? data.count : 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    SimpleListCell *cell = [self.businesses dequeueReusableCellWithIdentifier:@"SimpleListCell"];
    Business *business = [self->data objectAtIndex:indexPath.row];
    cell.title.text = business.name;
    Image *image = [business getImage];
    if (image) {
        [self loadImageURL:image.thumbnail
                      into:cell.image
             withIndicator:cell.imageActivity];
    } else {
        cell.image.image = nil;
        cell.imageActivity.hidden = true;
    }
    if (business.locations.count == 1)
        cell.subtitle.text = [NSString stringWithFormat:@"Includes %u work place", business.locations.count];
    else
        cell.subtitle.text = [NSString stringWithFormat:@"Includes %u work places", business.locations.count];
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];
    
    UIButton *editButton = [cell viewWithTag:100];
    [editButton removeTarget:self action:@selector(editBusiness) forControlEvents:UIControlEventTouchUpInside];
    [editButton addTarget:self action:@selector(editBusiness) forControlEvents:UIControlEventTouchUpInside];
    return cell;
}

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    // Return YES if you want the specified item to be editable.
    return NO;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (editingStyle == UITableViewCellEditingStyleDelete) {
        //add code here for when you hit delete
    }
}

- (void) editBusiness {
    NSInteger index = self.businesses.indexPathForSelectedRow.row;
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.hiddenLocation = YES;
    controller.business = [self->data objectAtIndex:index];
    [self.navigationController pushViewController:controller animated:YES];
}


- (IBAction)addBusiness:(id)sender {
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    [self.navigationController pushViewController:controller animated:YES];
}

- (IBAction)logout {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Logout"
                                                    message:@"Are you sure you want to logout?"
                                                   delegate:self
                                          cancelButtonTitle:@"No"
                                          otherButtonTitles:@"Yes", nil];
    [alert show];
}

- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1) {
        [self.navigationController popViewControllerAnimated:true];
    }
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_locations_list"]) {
        ListLocations *locationsView = [segue destinationViewController];
        Business *selectedBusiness = [data objectAtIndex:self.businesses.indexPathForSelectedRow.row];
        [locationsView setBusiness:selectedBusiness];
    } else if ([[segue identifier] isEqualToString:@"goto_edit_company"]) {
//        EditCompany *editView = [segue destinationViewController];
//        [editView setBusiness:self.business];
    }
}
@end
